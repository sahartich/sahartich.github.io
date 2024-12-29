// Using QueryStrings to get the IP address, then redirecting to fillout.

function validateIP(ip, pattern) {
    
    var res = ip.match(pattern);
    if (res === null) {
        // TODO: ERROR HANDLING
        return;
    }
    return res[0];

}

function trimPhone(phone) {
    // TODO: trim what's necessary
    // check that the remaining number is valid in terms of length and isNumber
    return;
    // TODO: ERROR HANDLING
}

async function fetchPort(ip, address) {
    const ip_regex = ip.replace(/\./g,'\\.')
    const pattern = new RegExp(`(?<=\\D${ip_regex}\\s\\|\\sUser\\sPort:\\s)\\d{1,5}`, 'gm');

    try {
        const response = await fetch(`${address}${ip}`);
        if (!response.ok) {
        // TODO: ERROR HANDLING
            return;
        }
        const data = await response.text();
        const res = data.match(pattern);
        if (res === null) {
            // TODO: ERROR HANDLING
            return;
        }
        return res[res.length-1];
      

    } catch (error) {
      // TODO: ERROR HANDLING
    }
  }

  async function main(){
    const IP_PARAMATER = 'IP_Address'
    const ip_pattern = /^([1-9]\d?|1\d{1,2}|2([0-4]\d)|25[0-5])(\.(0|[1-9]\d?|1\d{1,2}|2([0-4]\d)|25[0-5])){3}$/;
    const address = 'https://corsproxy.io/?https://sahar.org.il/iplog/iplog.php?ip=';
    const redirect = new URL('https://forms.fillout.com/t/hFMFdrktXzus?');
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (params.has(IP_PARAMATER)) {
        const ip = validateIP(params.get(IP_PARAMATER),ip_pattern);

        if (!ip) { return; }
        const port = await fetchPort(ip,address);

        if (!port) { return; }
        params.set(IP_PARAMATER,`${ip}:${port}`);

    } else if (params.has('phone')) {
        const phone = trimPhone(params.get('phone'));
        if (!phone) { return; }
    }
    else {
    // TODO: ERROR HANDLING
        return;
    }
    redirect.search = params.toString();
    window.location.href = redirect.toString();
}

main();