const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET
const secret2 = process.env.SECRETS

function verify(){
    jwt.verify(req.body.token, secret, function(err, decoded) {
        if (err) return res.status(400).send({ message: 'Failed to authenticate token.' });
        
        req.user = decoded
        next()
    });
}

function verifyAdmin(){
    jwt.verify(req.body.token, secret2, function(err, decoded) {
        if (err) return res.status(400).send({ message: 'Failed to authenticate token.' });
        
        req.isAdmin = true
        next()
    });
}

module.exports = function routes(app, User, Admin, Transactions){
    
    app.get('/', (req,res)=>{
        res.send("Welcome to Funda Wallet")
    })

    app.post('/register', (req, res)=>{
        let data = req.body
        if(data.firstName && data.email && data.currency && data.password){
            let {firstName, lastName, currency, email, country}  = data
            bcrypt.hash(data.password, (err, hash)=>{
                User.create({firstName, lastName, email, country, password:hash, currency,createdAt: new Date(),updatedAt: new Date() }).then(user=>{
                    var token = jwt.sign({email, password: hash, level: user.level}, secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.json({"message":"registration successful", token})
                })
            })
        }else{
            res.status(400).send({ message: 'Email or Password Incorrect' })
        }
    })

    app.post('/registeradmin', (req, res)=>{
        let data = req.body
        if(data.firstName && data.email && data.password){
            let {firstName, lastName, email, country}  = data
            bcrypt.hash(data.password, (err, hash)=>{
                Admin.create({firstName, lastName, email, country, password:hash, createdAt: new Date(),updatedAt: new Date() }).then(user=>{
                    var token = jwt.sign({email, password: hash, isAdmin:true}, secret2, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.json({"message":"registration successful", token})
                })
            })
        }else{
            res.status(400).send({ message: 'Email or Password Incorrect' })
        }
    })

    app.post('/login', async(req,res)=>{
        let {email, password} = req.body
        if(email && password){
            let user = await User.findOne({
                where: {email}
            })
            if(user){
                let result = bcrypt.compareSync(password, user.password)
                if(result){
                    var token = jwt.sign({email, password, level: user.level}, secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.json({"message":"login successful", token})
                }else{
                    res.status(400).send({ message: 'Email or Password Incorrect' })
                }
            }else{
                res.status(400).send({ message: 'Email or Password Incorrect' })
            }
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/loginadmin', async(req,res)=>{
        let {email, password} = req.body
        if(email && password){
            let user = await Admin.findOne({
                where: {email}
            })
            if(user){
                let result = bcrypt.compareSync(password, user.password)
                if(result){
                    var token = jwt.sign({email, password, level: user.level}, secret2, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.json({"message":"login successful", token})
                }else{
                    res.status(400).send({ message: 'Email or Password Incorrect' })
                }
            }else{
                res.status(400).send({ message: 'Email or Password Incorrect' })
            }
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/fund', verifyAdmin, async(req, res)=>{
        let {amount, currency, name, email, id} = req.body
        if(amount, name, currency){
            let user = await User.findOne({
                where: {email}
            })
            let trans = await Transactions.findOne({where:{id}})
            if(user.level == "Noob"){
                await trans.update({status: "approved", approved:true,updatedAt: new Date() })
                
                user.balance += trans.amount
                user.save()
            }else{
                let cur = trans.currency
                if(cur== user.currency1){
                    user.balance1 += trans.amount
                }else if(cur ==user.currency2){
                    user.balance2 += trans.amount
                }else if(cur == user.currency3){
                    user.balance3 += trans.amount
                }else{
                    user.balance += trans.amount
                }
                user.save()
            }

            res.json({message: "Transaction successful", amount,email, username: user.firstName, sender: name})
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/credit', verify, async(req,res)=>{
        let {amount, currency, name} = req.body
        let email = req.user.email
        if(amount, name, currency){
            let user = await User.findOne({
                where: {email}
            })
            if(user.level=="Noob"){
                if(currency !== user.currency){
                    let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                    let result = await res.json()
                    amount = result.info.rate
                }
            }else{
                if(currency !== user.currency){
                    if(user.currency1 && currency !== user.currency1 ){
                        if(user.currency2 && currency !== user.currency2){
                            if(user.currency3 && currency !== user.currency3){
                                let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                                let result = await res.json()
                                amount = result.info.rate
                            }else{
                                user.currency3 = currency
                                user.balance3 = "0.00"
                                user.save()
                            }
                        }else{
                            user.currency2 = currency
                            user.balance2 = "0.00"
                            user.save()
                        }
                    }else{
                        user.currency1 = currency
                        user.balance1 = "0.00"
                        user.save()
                    }
                    
                }
            }

            Transactions.create({userId: user.id, amount, credit:true, currency, name,
                createdAt: new Date(),updatedAt: new Date(), status: "pending", type:"credit" }).then(trans=>{
                    res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
            })

        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/send', verify, async(req,res)=>{
        let {amount, name, email, currency} = req.body
        let mail = req.user.email
        let amount2 = amount
        if(amount, name, currency){
            let user = await User.findOne({
                where: {email:mail}
            })
            let recipient = await User.findOne({
                where: {email}
            })

            if(recipient.level == "Noob"){
                if(recipient.currency !== user.currency){
                    let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${user.currency}&to=${recipient.currency}&amount=${amount}`)
                    let result = await res.json()
                    amount2 = result.info.rate
                }
            }else{
                if(currency !== recipient.currency){
                    if(recipient.currency1 && currency !== recipient.currency1 ){
                        if(recipient.currency2 && currency !== recipient.currency2){
                            if(recipient.currency3 && currency !== recipient.currency3){
                                let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${recipient.currency}&amount=${amount}`)
                                let result = await res.json()
                                amount = result.info.rate
                            }else{
                                recipient.currency3 = currency
                                recipient.balance3 = "0.00"
                                recipient.save()
                            }
                        }else{
                            recipient.currency2 = currency
                            recipient.balance2 = "0.00"
                            recipient.save()
                        }
                    }else{
                        recipient.currency1 = currency
                        recipient.balance1 = "0.00"
                        recipient.save()
                    }
                    
                }
            }
    
            Transactions.create({userId: user.id, recipientId: recipient.id, amount, credit:false, currency:user.currency, name,
                createdAt: new Date(),updatedAt: new Date(), status: "pending", type:"send" }).then(trans=>{
                    res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
            })
            Transactions.create({userId: recipient.id, amount:amount2, credit:true, currency:currency, name,
                createdAt: new Date(),updatedAt: new Date(), status: "pending", type:"receive" }).then(trans=>{
                    res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
            })
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/sent',verifyAdmin, async(req,res)=>{
        let {id} = req.body
        if(id){
            let trans = await Transactions.findOne({where:{id}})
            if(trans){
                if(trans.recipientId){
                    let trans2 = await Transactions.findOne({where:{id: trans.recipientId}})
                    await trans2.update({status: "approved", approved:true,updatedAt: new Date() })
                    let user2 = await User.findOne({where:{id: trans2.userId}})
                    if(user2.level == "Noob"){
                        user2.balance += trans2.amount
                        user2.save()
                    }else{
                        let curr = trans2.currency
                        if(curr== user2.currency1){
                            user2.balance1 += trans2.amount
                        }else if(curr ==user2.currency2){
                            user2.balance2 += trans2.amount
                        }else if(curr == user2.currency3){
                            user2.balance3 += trans2.amount
                        }else{
                            user2.balance += trans2.amount
                        }
                        user2.save()
                    }
                }
                
                await trans.update({status: "approved", approved:true,updatedAt: new Date() })
                let user1 = await User.findOne({where:{id: trans.userId}})
                if(user1.level == "Noob"){
                    user1.balance -= trans.amount
                    user1.save()
                }else{
                    let cur = trans.currency
                    if(cur== user1.currency1){
                        user1.balance1 -= trans.amount
                    }else if(cur ==user1.currency2){
                        user1.balance2 -= trans.amount
                    }else if(cur == user1.currency3){
                        user1.balance3 -= trans.amount
                    }else{
                        user1.balance -= trans.amount
                    }
                    user1.save()
                }
    
                res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
            }else{
                res.status(400).send({ message: 'Incorrect Id' })
            }

        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/debit', verify, async(req,res)=>{
        let {amount, currency} = req.body
        let email = req.user.email
        if(email && amount){
            let user = await User.findOne({
                where: {email}
            })
            if(user){
                if(user.level == "Noob"){
                    if(currency && currency !== user.currency){
                        let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                        let result = await res.json()
                        amount = result.info.rate
                    }
                
                }else{
                    if(currency !== user.currency){
                        if(user.currency1 && currency !== user.currency1 ){
                            if(user.currency2 && currency !== user.currency2){
                                if(user.currency3 && currency !== user.currency3){
                                    let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                                    let result = await res.json()
                                    amount = result.info.rate
                                }else{
                                    user.currency3 = currency
                                    user.balance3 = "0.00"
                                    user.save()
                                }
                            }else{
                                user.currency2 = currency
                                user.balance2 = "0.00"
                                user.save()
                            }
                        }else{
                            user.currency1 = currency
                            user.balance1 = "0.00"
                            user.save()
                        }
                    }
                }
                Transactions.create({userId: user.id, amount, credit:false, currency: currency | user.currency,
                    createdAt: new Date(),updatedAt: new Date(), status: "pending", type:"withdraw" }).then(trans=>{
                        res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, id:trans.id})
                })
            }else{
                res.status(400).send({ message: 'Invalid input or expired token' })
            }
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/withdraw', verifyAdmin, async(req,res)=>{
        let {id} = req.body
        if(id){
            let trans = await Transactions.findOne({where:{id}})
            if(trans){
                
                await trans.update({status: "approved", approved:true,updatedAt: new Date() })
                let user1 = await User.findOne({where:{id: trans.userId}})
                if(user1.level =="Noob"){
                    user1.balance -= trans.amount
                    user1.save()
                }else{
                    let cur = trans.currency
                    if(cur== user1.currency1){
                        user1.balance1 -= trans.amount
                    }else if(cur ==user1.currency2){
                        user1.balance2 -= trans.amount
                    }else if(cur == user1.currency3){
                        user1.balance3 -= trans.amount
                    }else{
                        user1.balance -= trans.amount
                    }
                    user1.save()
                }
    
                res.json({message: "Transaction successful", amount, username: user.firstName, id:trans.id})
            }else{
                res.status(400).send({ message: 'Incorrect Id' })
            }

        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/addcurrency', verify, async(req,res)=>{
        let email = req.user.email
        let user = await User.findOne({
            where: {email}
        })
        if(req.user.level !== "Noob"){
            if(!user.currency1){
                user.currency1 = req.body.currency
                user.balance1 = "0.00"
                user.save()
                res.json({message: "Second currency successfully added", currency: user.currency1})
            }else if(!user.currency2){
                user.currency2 = req.body.currency
                user.balance2 = "0.00"
                user.save()
                res.json({message: "Third currency successfully added", currency: user.currency2})
            }else if(!user.currency3){
                user.currency3 = req.body.currency
                user.balance23 = "0.00"
                user.save()
                res.json({message: "Fourth currency successfully added", currency: user.currency3})
            }else{
                res.status(400).send({ message: 'Maximum of four currencies can be used at once' })
            }
        }else{
            res.status(400).send({ message: 'You can only use one currency at your level' })
        }
    })

    app.put('/changelevel', verifyAdmin, async(req,res)=>{
        let {level, email} = req.body
        let user = await User.findOne({
            where: {email}
        })
        
        if(user){
            user.level = level
            user.save()
            res.status(203).send({ message: 'User level updated' })
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })

    app.put('/changecurrency', verifyAdmin, async(req,res)=>{
        let {currency, email} = req.body
        let user = await User.findOne({
            where: {email}
        })
        
        if(user){
            user.currency = currency
            user.save()
            res.status(203).send({ message: 'User main currency updated' })
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })
    
    app.post('/directfund', verifyAdmin, async(req,res)=>{
        let {amount, currency, email} = req.body
        if(amount, currency, email){
            let user = await User.findOne({
                where: {email}
            })
    
            if(user){
                if(currency && currency !== user.currency){
                    let res = await fetch(`https://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                    let result = await res.json()
                    amount = result.info.rate
                }
    
                Transactions.create({userId: user.id, amount, credit:true, currency: currency | user.currency,
                    createdAt: new Date(),updatedAt: new Date(), status: "approved",approved:true, type:"withdraw" }).then(trans=>{
                        res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
                })
                user.balance -= amount
                user.save()
                res.json({message: "Transaction successful", amount, username: user.firstName, id:trans.id})
            }else{
                res.status(400).send({ message: 'Invalid user' })
            }
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })
}
