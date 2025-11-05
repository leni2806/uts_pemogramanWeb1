function showAlert(msg){ alert(msg); }
function getGreeting(){
    const h = new Date().getHours();
    if(h < 12) return "Selamat Pagi";
    if(h < 15) return "Selamat Siang";
    if(h < 18) return "Selamat Sore";
    return "Selamat Malam";
}