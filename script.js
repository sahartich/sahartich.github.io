// Using QueryStrings to get the IP address, then redirecting to fillout.
// function getParams(){
//     return params;
//     }

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

async function fetchPort(ip, pattern, address) {
    try {
        const response = await fetch(`${address}${ip}`, {
            signal: AbortSignal.timeout(50000)  // Abort the request if it takes longer than 5 seconds
        });
        if (!response.ok) {
        // TODO: ERROR HANDLING
            return;
        }
        const data = await response.text();
        alert(data);
        const res = data.match(pattern);
        if (res === null) {
            // TODO: ERROR HANDLING
            return;
        }
      return res[res.length-1];
      

    } catch (error) {
      // TODO: ERROR HANDLING
      alert(error);
    }
  }

function main(){
    const ip_pattern = /^([1-9]\d?|1\d{1,2}|2([0-4]\d)|25[0-5])(\.(0|[1-9]\d?|1\d{1,2}|2([0-4]\d)|25[0-5])){3}$/;
    const port_pattern = new RegExp(`(?<=\D${ip_pattern}\s\|\sUser\sPort:\s)\d{1,5}`, 'gm');
    const address = 'https://sahar.org.il/iplog/iplog.php?ip=';
    const redirect = 'https://forms.fillout.com/t/hFMFdrktXzus?';

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (params.has('ip')) {
        const ip = validateIP(params.get('ip'),ip_pattern);

        if (!ip) { return; }
        const port = fetchPort(ip,port_pattern,address);

        if (!port) { return; }
        params.set('ip',`${ip}:${port}`);

    } else if (params.has('phone')) {
        const phone = trimPhone(params.get('phone'));
        if (!phone) { return; }
    }
    else {
    // TODO: ERROR HANDLING
        return;
    }
    url.search = params.toString();
}

main();