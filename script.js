lpTag.agentSDK.init({});

async function getVars(info_type) {
    try{
        return new Promise((resolve) => {
            lpTag.agentSDK.get(info_type, function(info_type) {
                resolve(info_type);
            });
        });
    } catch (e) {
        console.log(`Error:${e}, could not retrieve ${info_type}`);
    }
    return undefined;
}

async function dateManipulation(raw_datetime) {
    const datetime = new Date(raw_datetime);
    let formatted_date = undefined;
    let formatted_time = undefined;

    const optionsDate = {
        timeZone: 'Asia/Jerusalem',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const optionsTime = {
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    if (datetime instanceof Date && !isNaN(datetime)) {
        formatted_date = new Intl.DateTimeFormat('en-GB', optionsDate).format(datetime);
        formatted_time = new Intl.DateTimeFormat('en-GB', optionsTime).format(datetime);
    } else {
        console.log('Invalid time object');
    }
    return {'formatted_date': formatted_date, 'formatted_time': formatted_time};
}

async function conversationContentManipulation(chat) {
    try {
        const response = await fetch('/config.json');
        var data = await response.json();
        console.log(data);
    } catch (e) {
        console.log(`Error:${e}, could not fetch port website`);
    }
    let nickname = undefined;
    let age = undefined;
    let start_time = undefined;
    let total_time = undefined;

    for (let i = 0; i < chat.length - 1; i++) {
        if (nickname && age && start_time) {
            break;
        }
        if (!(chat[i]?.source === 'agent')) {
            continue;
        }
        if  (!(chat[i]?.by?.includes(data.heb.bot_name) || chat[i]?.by === data.arb.bot_name)) {
            if (start_time === undefined) {
                start_time = await dateManipulation(chat[i]?.time);
                start_time = start_time.formatted_time;
                total_time = Math.floor((chat[chat.length - 1]?.time - chat[i]?.time) / 60000);
            }
            continue;
        }
        if ((chat[i]?.text === data.heb.nickname_prompt || chat[i]?.text === data.arb.nickname_prompt) && nickname === undefined) {
            nickname = chat[i+1]?.text || '';
        } 
        if ((chat[i]?.type === 'richContent' || chat[i]?.text === data.heb.age_prompt || chat[i]?.text === data.arb.age_prompt) && nickname !== undefined && age === undefined) {
            age = chat[i+1]?.text || '';
        } 
    }
    return { 'nickname': nickname, 'age': age, 'agent_reply_time': start_time, 'chat_total_time': total_time };
}

async function getPort(ip, cors_url){
    const escaped_ip = ip.replace(/\./g,'\\.');
    const pattern = new RegExp(`(?<=\\D${escaped_ip}\\s\\|\\sUser\\sPort:\\s)\\d{1,5}`, 'gm');
    try {
        const response = await fetch(`${cors_url}${ip}`, {
            signal: AbortSignal.timeout(10000),
            });
        var data = await response.text();
    } catch (e) {
        console.log(`Error:${e}, could not fetch port website`);
    }
    const res = data.match(pattern);
    return res?.[res.length-1] || 'no port found';
}

async function main() {
    alert('success1');
    const form_url = "https://forms.fillout.com/t/ihmcrWb6kkus";
    const cors_url = "https://corsproxy.io/?https://sahar.org.il/iplog/iplog.php?ip=";

    const visitor_info = await getVars('visitorInfo');
    const chatting_agent_info = await getVars('chattingAgentInfo');
    const agent_info = await getVars('agentInfo');
    const chat_transcript = await getVars('chatTranscript');
    const engagement_info = await getVars('engagementInfo');
    const chat_info = await getVars('chatInfo');
    const authenticated_data = await getVars('authenticatedData');

    let skill = engagement_info?.skill;
    let port = undefined;

    if (skill?.toLowerCase().includes("whatsapp")){
        skill = 'WhatsApp';
    } else {
        skill = 'Web';
        port = await getPort(visitor_info?.IpAddress, cors_url);
    }

    const chat_start_datetime = await dateManipulation(visitor_info?.visitStartTime || '');
    const chat_content_vars = await conversationContentManipulation(chat_transcript?.lines || ['']);

    const params = new URLSearchParams({
        'agent_name':  chatting_agent_info?.agentName || '',
        'manager_name': agent_info?.agentName || '',
        'manager_email': agent_info?.agentEmail || '',
        'visitor_name': visitor_info?.visitorName || '',
        'skill': skill,
        'chat_start_date': chat_start_datetime?.formatted_date || '',
        'chat_start_time': chat_start_datetime?.formatted_time || '',
        'conversation_id': chat_info?.rtSessionId || '',
        'agent_reply_time': chat_content_vars?.agent_reply_time || '',
        'chat_total_time': chat_content_vars?.chat_total_time || '',
        'nickname': chat_content_vars?.nickname || '',
        'age': chat_content_vars?.age || '',
        'ip_address': visitor_info?.IpAddress || '',
        'phone_number': authenticated_data?.personalInfo?.contactInfo[0]?.phone || '',
        'port': port || '',
    });
    window.location.href = `${form_url}?${params.toString()}`;
}

window.onload = main;