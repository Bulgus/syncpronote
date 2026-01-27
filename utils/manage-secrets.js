const fs = require("fs")
const path = require("path")

module.exports.parse = function (secretsPath) {
	var secretsParsed = {}
	
	// Try to read from file first
	if(fs.existsSync(secretsPath)){
		const secrets = fs.readFileSync(secretsPath, "utf8")
		try { secretsParsed = JSON.parse(secrets) } catch (error) {
			console.error(`Erreur lors de la lecture du fichier ${secretsPath}: ${error.message || error}`)
			process.exit(1)
		}
	} else {
		// Create empty file if it doesn't exist
		fs.mkdirSync(path.dirname(secretsPath), { recursive: true })
		fs.writeFileSync(secretsPath, "{}")
		console.log(`Fichier situé à ${secretsPath} créé. Ajoutez le au .gitignore`)
	}

	// Override with environment variables if they exist
	// This allows Docker/Dokploy deployments to use env vars
	const envVars = [
		'GOOGLE_CALENDAR_ID',
		'GOOGLE_CLIENT_ID',
		'GOOGLE_CLIENT_SECRET',
		'GOOGLE_REFRESH_TOKEN',
		'PRONOTE_ROOT_URL',
		'PRONOTE_TOKEN',
		'PRONOTE_ACCOUNT_KIND',
		'PRONOTE_USERNAME',
		'PRONOTE_DEVICE_UUID',
		'NTFY_URL',
		'NTFY_TOPIC',
		'NTFY_USERNAME',
		'NTFY_PASSWORD',
		'UPTIME_PING_URL'
	]

	envVars.forEach(varName => {
		if(process.env[varName] !== undefined && process.env[varName] !== '') {
			secretsParsed[varName] = process.env[varName]
		}
	})

	return secretsParsed
}

module.exports.save = function (secretsPath, json = {}) {
	if(!fs.existsSync(secretsPath)){
		fs.mkdirSync(path.dirname(secretsPath), { recursive: true })
		fs.writeFileSync(secretsPath, "{}")

		console.log(`Fichier situé à ${secretsPath} créé. Ajoutez le au .gitignore`)
	}

	fs.writeFileSync(secretsPath, JSON.stringify(json, null, 2))

	return true
}