async function main(){
    const ip_param = 'IP_Address';
    const address = 'https://corsproxy.io/?https://sahar.org.il/iplog/iplog.php?ip=';
    const redirect = new URL('https://forms.fillout.com/t/hFMFdrktXzus?');
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (params.has(ip_param)) {
        alert(params);
        const ip = params.get(ip_param);
        const escaped_ip = ip.replace(/\./g,'\\.');
        const pattern = new RegExp(`(?<=\\D${escaped_ip}\\s\\|\\sUser\\sPort:\\s)\\d{1,5}`, 'gm');
        try {
            const response = await fetch(`${address}${ip}`, {
                signal: AbortSignal.timeout(15000),
              });
            const data = await response.text();
            const res = data.match(pattern);
            const port = res[res.length-1];
            params.set(ip_param,`${ip}:${port}`);
        }
        catch (e) {}
    }
    redirect.search = params.toString();
    window.location.href = redirect.toString();  
}

main();
