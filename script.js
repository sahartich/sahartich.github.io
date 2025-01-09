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
    const nickname_question = 'אנא רשמו שם או כינוי';
    const age_question = `על מנת שאוכל להעניק לך מענה מותאם, אנא הקלד/י את גילך (ספרות בלבד)`;
    const automatic_reply = 'מענה אוטומטי';

    let nickname = undefined;
    let age = undefined;
    let start_time = undefined;
    let total_time = undefined;

    for (let i = 0; i < chat.length - 1; i++) {
        console.log(chat[i]);
        if (chat[i]?.text === nickname_question && chat[i]?.source === 'agent' && chat[i]?.by?.includes(automatic_reply) && chat[i+1]?.source === 'visitor' && nickname === undefined){
            nickname = chat[i+1]?.text || '';
        } 
        if ((chat[i]?.type === 'richContent' || chat[i]?.text === age_question) && chat[i]?.source === 'agent' && chat[i]?.by?.includes(automatic_reply) && chat[i+1]?.source === 'visitor' && nickname !== undefined && age === undefined){
            age = chat[i+1]?.text || '';
        } 
        if (chat[i]?.source === 'agent' && !chat[i]?.by?.includes(automatic_reply) && start_time === undefined){
            start_time = await dateManipulation(chat[i]?.time);
            start_time = start_time.formatted_time;
            total_time = Math.floor((chat[chat.length - 1]?.time - chat[i]?.time) / 60000);
        }
    }
    return { 'nickname': nickname, 'age': age, 'agent_reply_time': start_time, 'chat_total_time': total_time }
}

async function getPort(ip){
    const cors = 'https://corsproxy.io/?https://sahar.org.il/iplog/iplog.php?ip=';
    try {
        const escaped_ip = ip.replace(/\./g,'\\.');
        const pattern = new RegExp(`(?<=\\D${escaped_ip}\\s\\|\\sUser\\sPort:\\s)\\d{1,5}`, 'gm');
        const response = await fetch(`${cors}${ip}`, {
            signal: AbortSignal.timeout(10000),
            });
        const data = await response.text();
        const res = data.match(pattern);
        const port = res[res.length-1];
        alert(port);
        return port;
    } catch (e) {
        console.log('Could not retrieve Port address');
    }
    return undefined;
}

async function main() {
    const baseUrl = 'https://forms.fillout.com/t/hFMFdrktXzus';

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
    }
    else {
        skill = 'Web';
        port = await getPort(visitor_info?.IpAddress);
    }

    const chat_start_datetime = await dateManipulation(visitor_info?.visitStartTime || '');
    const chat_content_vars = await conversationContentManipulation(chat_transcript?.lines || '',);

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
    alert(params);
    window.location.href = `${baseUrl}?${params.toString()}`;
}

window.onload = main;