const mineflayer = require('mineflayer')
const mc = require('minecraft-protocol')
const http = require('http')

// 🌐 1. سيرفر الويب المدمج لإبقاء البوت شغالاً 24/7 بدون نوم
const webServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('AFK Proxy Server is Active 24/7!')
})
webServer.listen(8080, () => {
    console.log('🌐 [KEEP-ALIVE] Web page active on port 8080 for UptimeRobot.')
})

// ⚙️ إعدادات الحسابات والاتصال
const accounts = [
    { username: 'ResbRegend234' },
    { username: 'Ahmedmc523' }
]
const password = 'semestre50'
const myOwner = 'edwsfc'
const targetAdmin = 'Subham190161' // الاسم المراد الهروب منه
let consoleChatEnabled = true

const targetHost = '148.113.25.124' // سيرفر الماينكرافت الأساسي
const targetPort = 19132

let proxyClient = null // تخزين اللاعب الحقيقي (أنت) عندما تتصل بالبوت
const bots = {}

// 🛡️ 2. إنشاء السيرفر الوهمي داخل Codespaces لتدخل أنت من خلاله
const localProxyServer = mc.createServer({
    'online-mode': false, 
    encryption: true,
    host: '0.0.0.0',
    port: 25565, 
    version: '1.20.1'
})

console.log('🎮 [PROXY-SERVER] Local Minecraft server layout ready on port 25565.')

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
            console.log(`🚀 [LOG] Bot [${bot.username}] connected to main server successfully!`)
            
            // التحقق الفوري عند الدخول: هل الشخص المحظور متواجد؟
            if (account.username === 'ResbRegend234') {
                const isTargetOnline = Object.keys(bot.players).some(p => p.toLowerCase() === targetAdmin.toLowerCase())
                if (isTargetOnline) {
                    console.log(`🚨 [EVADE] الشخص ${targetAdmin} متواجد حالياً! البوت يخرج فوراً وسيعيد المحاولة بعد 5 دقائق.`)
                    bot.quit()
                    return;
                }
            }

            // تسجيل دخول بشري مموه عشوائي لتفادي كشف الأدمن
            const delay1 = Math.floor(Math.random() * 3000) + 4000
            const delay2 = Math.floor(Math.random() * 3000) + 3000
            setTimeout(() => {
                if (bot.entity) {
                    bot.chat(`/l ${password}`)
                    setTimeout(() => {
                        if (bot.entity) bot.chat(`/login ${password}`)
                    }, delay2)
                }
            }, delay1)

            bot.setControlState('sneak', true)

            // الالتفات العشوائي المحاكي للبشر لمنع كشف الـ AFK
            setInterval(() => {
                if (bot.entity && !proxyClient) { 
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180)
                    bot.look(yaw, 0)
                }
            }, 30000)

            // نظام البيع التلقائي المستقر
            setInterval(() => {
                if (bot.entity) { 
                    bot.chat('/sellall cactus')
                    console.log(`💰 [SALE] [${bot.username}] Sent: /sellall cactus`)
                    setTimeout(() => {
                        if (bot.entity) bot.chat('/sell inventory')
                    }, 60000)
                }
            }, 120000)
        })

        // 👁️ نظام المراقبة اللحظية: فحص دخول اللاعبين أثناء تواجد البوت
        bot.on('playerJoined', (player) => {
            if (account.username === 'ResbRegend234' && player.username.toLowerCase() === targetAdmin.toLowerCase()) {
                console.log(`🚨 [EVADE] تحذير! دخل ${targetAdmin} إلى السيرفر الآن! البوت ResbRegend234 يهرب ويقطع الاتصال فوراً.`)
                bot.quit()
            }
        })

        // 🔗 تحويل وتمرير الحزم البرمجية من السيرفر الأساسي إليك
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

            // --- تصحيح حماية الأوامر وتعديل نظام الـ Split لتعمل للمالك edwsfc فقط ---
            // يبحث في الرسالة ليتأكد أن اسمك edwsfc موجود فيها كمرسل قبل معالجة الـ %
            if (message.toLowerCase().includes(myOwner.toLowerCase())) {
                
                // 1. أمر التحكم العام %do
                if (message.includes('%do ')) {
                    const parts = message.split(/%do\s+/i)
                    if (parts.length > 1) {
                        let textToSend = parts[parts.length - 1].replace(/\./g, '').trim()
                        if (textToSend.length > 0) {
                            bot.chat(textToSend)
                            console.log(`✨ [DO-ACTION] [${bot.username}] Executed: "${textToSend}"`)
                        }
                    }
                }

                // 2. أوامر السنيك للمالك
                if (msgLower.includes('%sneak on')) {
                    bot.setControlState('sneak', true)
                } else if (msgLower.includes('%sneak off')) {
                    bot.setControlState('sneak', false)
                }

                // 3. أوامر الحركة للمالك (تطبق على البوت ResbRegend234)
                if (account.username === 'ResbRegend234') {
                    if (msgLower.includes('%jump')) {
                        bot.setControlState('jump', true)
                        setTimeout(() => bot.setControlState('jump', false), 500)
                    }
                    if (msgLower.includes('%walk')) {
                        bot.setControlState('forward', true)
                        setTimeout(() => bot.setControlState('forward', false), 1000)
                    }
                    if (msgLower.includes('%back')) {
                        bot.setControlState('back', true)
                        setTimeout(() => bot.setControlState('back', false), 1000)
                    }
                }
            }
        })

        bot.on('end', () => {
            const isTargetOnline = bot.players && Object.keys(bot.players).some(p => p.toLowerCase() === targetAdmin.toLowerCase())
            const reconnectDelay = isTargetOnline ? 300000 : 30000;
            
            if (isTargetOnline) {
                console.log(`⚠️ [DISCONNECT] [${account.username}] تم الفصل للهروب. إعادة المحاولة بأمان بعد 5 دقائق...`)
            } else {
                console.log(`⚠️ [DISCONNECT] [${account.username}] فقد الاتصال طبيعياً. إعادة المحاولة بعد 30 ثانية...`)
            }
            
            setTimeout(() => createBot(account), reconnectDelay)
        })

        // ربط السيرفر الوهمي بالتحكم
        localProxyServer.on('login', (newClient) => {
            console.log(`🙋 [CONNECT] You are connecting to the bot from IP: ${newClient.socket.remoteAddress}`)
            proxyClient = newClient
            
            newClient.on('packet', (data, meta, rawData) => {
                if (bot._client) bot._client.writeRaw(rawData)
            })

            newClient.on('end', () => {
                console.log('🏃 [DISCONNECT] You closed the connection to the bot.')
                proxyClient = null
            })
        })

    }, delay)
}

// تشغيل البوت الأول والثاني بتباعد زمني
createBot(accounts[0], 0)
createBot(accounts[1], 30000)

// نظام التحكم الكامل من الكونسول
process.stdin.on('data', (data) => {
    const input = data.toString().trim()
    if (input === 'stop chat') {
        consoleChatEnabled = false
        console.log('🛑 كونسول الشات معطل.')
    } else if (input === 'start chat') {
        consoleChatEnabled = true
        console.log('✅ كونسول الشات مفعل.')
    } else if (input && consoleChatEnabled) {
        Object.values(bots).forEach(b => {
            if (b.entity) b.chat(input)
        })
    }
})
