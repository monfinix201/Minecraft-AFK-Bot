const mineflayer = require('mineflayer')
const mc = require('minecraft-protocol')
const http = require('http')

// 🌐 1. سيرفر الويب لإبقاء البوت شغالاً 24/7
const webServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('AFK Proxy Server is Active 24/7!')
})
webServer.listen(8080, () => {
    console.log('🌐 [KEEP-ALIVE] Web page active on port 8080.')
})

// ⚙️ إعدادات الحسابات والاتصال
const accounts = [
    { username: 'ResbRegend234' },
    { username: 'Ahmedmc523' }
]
const password = 'semestre50'
const myOwner = 'edwsfc'
const targetAdmin = 'Subham190161' 
let consoleChatEnabled = true

const targetHost = '148.113.25.124' 
const targetPort = 19132

let proxyClient = null 
const bots = {}

// 🛡️ 2. إنشاء السيرفر الوهمي
const localProxyServer = mc.createServer({
    'online-mode': false, 
    encryption: true,
    host: '0.0.0.0',
    port: 25565, 
    version: '1.20.1'
})

console.log('🎮 [PROXY-SERVER] Local Minecraft server layout ready on port 25565.')

// 🔥 دالة الالتفات الفائقة لتخطي كشف الزوايا (AngleGuard Bypass)
function customSmoothLook(bot, targetYaw, targetPitch, steps = 20, interval = 40) {
    if (!bot.entity) return;
    let currentStep = 0;
    
    // تأمين الزوايا لمنع قفزات الحزم المفاجئة التي يلقطها AngleGuard
    const startYaw = bot.entity.yaw;
    const startPitch = bot.entity.pitch;
    
    let yawDiff = targetYaw - startYaw;
    // ضبط التفاف الـ Yaw ليكون في أقصر اتجاه زاوية ممكن (Human Mimic)
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    
    const pitchDiff = targetPitch - startPitch;

    const lookTimer = setInterval(() => {
        if (!bot.entity) {
            clearInterval(lookTimer);
            return;
        }
        currentStep++;
        const progress = currentStep / steps;
        
        // إدخال نسبة اهتزاز ماوس طبيعية جداً (Mouse Noise) لتخطي فحص النمط الآلي
        const noise = (Math.random() - 0.5) * 0.002; 
        
        const currentYaw = startYaw + (yawDiff * progress) + noise;
        const currentPitch = startPitch + (pitchDiff * progress) + noise;

        bot.look(currentYaw, currentPitch, true);

        if (currentStep >= steps) {
            clearInterval(lookTimer);
        }
    }, interval);
}

function createBot(account, delay = 0) {
    setTimeout(() => {
        console.log(`🤖 [SYSTEM] Connecting bot to main server: ${account.username}...`)
        
        const bot = mineflayer.createBot({
            host: targetHost,
            port: targetPort,
            username: account.username,
            version: '1.20.1'
        })

        bots[account.username] = bot

        bot.on('spawn', () => {
            console.log(`🚀 [LOG] Bot [${bot.username}] connected successfully!`)
            
            if (account.username === 'ResbRegend234') {
                const isTargetOnline = Object.keys(bot.players).some(p => p.toLowerCase() === targetAdmin.toLowerCase())
                if (isTargetOnline) {
                    console.log(`🚨 [EVADE] الشخص ${targetAdmin} متواجد! البوت يخرج فوراً.`)
                    bot.quit()
                    return;
                }
            }

            // تسجيل دخول بتواقيت بشرية متباعدة تماماً
            const delay1 = Math.floor(Math.random() * 5000) + 4000
            const delay2 = Math.floor(Math.random() * 3000) + 2500
            setTimeout(() => {
                if (bot.entity) {
                    bot.chat(`/l ${password}`)
                    setTimeout(() => {
                        if (bot.entity) bot.chat(`/login ${password}`)
                    }, delay2)
                }
            }, delay1)

            bot.setControlState('sneak', true)

            // 🟢 محاكاة حركة الـ AFK الذكية لـ AntiMaceAC
            // الالتفات التدريجي البشري
            setInterval(() => {
                if (bot.entity && !proxyClient) { 
                    const randomYaw = (Math.random() * 360 - 180) * (Math.PI / 180)
                    const randomPitch = (Math.random() * 20 - 10) * (Math.PI / 180) 
                    customSmoothLook(bot, randomYaw, randomPitch, 25, 45) 
                }
            }, Math.floor(Math.random() * 10000) + 20000)

            // حركة خفيفة جداً (Micro-Movement) خطوة للأمام وخطوة للخلف كل دقيقة لتجاوز فحص الثبات التام
            setInterval(() => {
                if (bot.entity && !proxyClient) {
                    bot.setControlState('forward', true)
                    setTimeout(() => {
                        bot.setControlState('forward', false)
                        bot.setControlState('back', true)
                        setTimeout(() => bot.setControlState('back', false), 150)
                    }, 150)
                }
            }, Math.floor(Math.random() * 20000) + 50000)

            // نظام البيع التلقائي المستقر بتواقيت مموهة
            setInterval(() => {
                if (bot.entity) { 
                    bot.chat('/sellall cactus')
                    console.log(`💰 [SALE] [${bot.username}] Sent: /sellall cactus`)
                    setTimeout(() => {
                        if (bot.entity) bot.chat('/sell inventory')
                    }, Math.floor(Math.random() * 4000) + 58000)
                }
            }, Math.floor(Math.random() * 15000) + 115000)
        })

        bot.on('playerJoined', (player) => {
            if (account.username === 'ResbRegend234' && player.username.toLowerCase() === targetAdmin.toLowerCase()) {
                console.log(`🚨 [EVADE] تحذير! دخل ${targetAdmin}! البوت يهرب فوراً.`)
                bot.quit()
            }
        })

        // تمرير الحزم الآمن
        bot._client.on('packet', (data, meta, rawData) => {
            if (proxyClient && account.username === 'ResbRegend234') { 
                proxyClient.writeRaw(rawData)
            }
        })

        bot.on('message', (jsonMsg) => {
            const message = jsonMsg.toString().trim()
            const msgLower = message.toLowerCase()

            if (message.length > 0 && consoleChatEnabled) {
                console.log(`💬 [CHAT] [${bot.username}] ${message}`)
            }

            if (message.toLowerCase().includes(myOwner.toLowerCase())) {
                if (message.includes('%do ')) {
                    const parts = message.split(/%do\s+/i)
                    if (parts.length > 1) {
                        let textToSend = parts[parts.length - 1].replace(/\./g, '').trim()
                        if (textToSend.length > 0) {
                            bot.chat(textToSend)
                        }
                    }
                }

                if (msgLower.includes('%sneak on')) bot.setControlState('sneak', true)
                if (msgLower.includes('%sneak off')) bot.setControlState('sneak', false)

                if (account.username === 'ResbRegend234') {
                    if (msgLower.includes('%jump')) {
                        bot.setControlState('jump', true)
                        setTimeout(() => bot.setControlState('jump', false), 200)
                    }
                    if (msgLower.includes('%walk')) {
                        bot.setControlState('forward', true)
                        setTimeout(() => bot.setControlState('forward', false), 700)
                    }
                    if (msgLower.includes('%back')) {
                        bot.setControlState('back', true)
                        setTimeout(() => bot.setControlState('back', false), 700)
                    }
                }
            }
        })

        bot.on('end', () => {
            const isTargetOnline = bot.players && Object.keys(bot.players).some(p => p.toLowerCase() === targetAdmin.toLowerCase())
            const reconnectDelay = isTargetOnline ? 300000 : (Math.floor(Math.random() * 10000) + 30000);
            setTimeout(() => createBot(account), reconnectDelay)
        })

    }, delay)
}

// تشغيل السيرفر الوهمي للتحكم
localProxyServer.on('login', (newClient) => {
    console.log(`🙋 [CONNECT] Connected to proxy from: ${newClient.socket.remoteAddress}`)
    proxyClient = newClient
    
    newClient.on('packet', (data, meta, rawData) => {
        if (bots['ResbRegend234'] && bots['ResbRegend234']._client) {
            bots['ResbRegend234']._client.writeRaw(rawData)
        }
    })

    newClient.on('end', () => {
        proxyClient = null
    })
})

// تشغيل البوتات بفاصل زمني آمن لتجنب حظر الـ IP المتزامن
createBot(accounts[0], 0)
createBot(accounts[1], 40000)

process.stdin.on('data', (data) => {
    const input = data.toString().trim()
    if (input === 'stop chat') consoleChatEnabled = false
    if (input === 'start chat') consoleChatEnabled = true
})
