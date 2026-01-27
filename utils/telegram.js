const path = require("path")
const manageSecrets = require("./manage-secrets")

var secrets = manageSecrets.parse(path.join(__dirname, "..", ".config", "secrets.json"))

module.exports = async function(title, message){
	if(!secrets.TELEGRAM_BOT_TOKEN || !secrets.TELEGRAM_CHAT_ID) return console.log("Envois d'alertes via Telegram désactivé (valeur manquante dans le .env)")
	else console.log(`Envoi d'une alerte via Telegram : ${title} - ${message}`)

	const url = `https://api.telegram.org/bot${secrets.TELEGRAM_BOT_TOKEN}/sendMessage`
	const text = `*${title}*\n\n${message}`

	var statusCode = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			chat_id: secrets.TELEGRAM_CHAT_ID,
			text: text,
			parse_mode: "Markdown"
		}),
		headers: {
			"Content-Type": "application/json"
		}
	}).then(res => res.status).catch(() => 999)

	return statusCode
}
