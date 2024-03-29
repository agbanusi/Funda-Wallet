const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET
const secret2 = process.env.SECRETS
const fetch = require('node-fetch')

function verify(req, res, next){
    jwt.verify(req.body.token, secret, function(err, decoded) {
        if (err) return res.status(400).send({ message: 'Failed to authenticate token.' });
        
        req.user = decoded
        next()
    });
}

function verifyAdmin(req, res, next){
    jwt.verify(req.body.token, secret2, function(err, decoded) {
        if (err) return res.status(400).send({ message: 'Failed to authenticate token.' });
        
        if(decoded.isAdmin){
            req.isAdmin = true
            next()
        }else{
            return res.status(400).send({ message: 'Failed to authenticate token.' });
        }
    });
}

module.exports = function routes(app, User, Admin, Transactions){
    
    app.get('/', (req,res)=>{
        res.send("Welcome to Funda Wallet")
    })

    app.post('/register', async(req, res)=>{
        let data = req.body
        let {firstName, lastName, currency, email, country, password}  = data

        if(firstName && email && currency && password){ 
            bcrypt.hash(password, 13, (err, hash)=>{
                User.create({firstName, lastName, email, country, password:hash, currency,createdAt: new Date(),updatedAt: new Date() })
                .then((user)=>{
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

    app.post('/registeradmin', async (req, res)=>{
        let data = req.body

        if(data.firstName && data.email && data.password){
            let {firstName, lastName, email, country}  = data
            bcrypt.hash(data.password, 13, (err, hash)=>{
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
            let users = await User.findOne({
                where: {email}
            })
            
            user =  users.dataValues
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
            let users = await Admin.findOne({
                where: {email}
            })
            
            user= users.dataValues
            if(user){
                let result = bcrypt.compareSync(password, user.password)
                if(result){
                    var token = jwt.sign({email, password, isAdmin:true}, secret2, {
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

        if(email && id){
            let users = await User.findOne({
                where: {email}
            })
            user = users.dataValues
            let transe = await Transactions.findOne({where:{id}})
            trans = transe.dataValues
            if(user.level == "Noob"){
                await transe.update({status: "approved", approved:true,updatedAt: new Date() })
                
                user.balance += trans.amount
                users.save()
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
                users.save()
            }

            res.json({message: "Transaction successful", amount,email, username: user.firstName, sender: name})
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/credit', verify, async(req,res)=>{
        let {amount, currency, name} = req.body
        let email = req.user.email

        if(amount&& name&& currency){
            let users = await User.findOne({
                where: {email}
            })
            user=users.dataValues
            if(user.level=="Noob"){
                if(currency !== user.currency){
                    let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                    let result = await red.json()
                    if(!result.info){
                        res.status(500).json({message: "An error occured in currency conversion"})
                        return
                    }
                    amount = result.info.rate
                }
            }else{
                if(currency !== user.currency){
                    if(user.currency1 && currency !== user.currency1 ){
                        if(user.currency2 && currency !== user.currency2){
                            if(user.currency3 && currency !== user.currency3){
                                let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                                let result = await red.json()
                                amount = result.info.rate
                            }else{
                                user.currency3 = currency
                                user.balance3 = "0.00"
                                users.save()
                            }
                        }else{
                            user.currency2 = currency
                            user.balance2 = "0.00"
                            users.save()
                        }
                    }else{
                        user.currency1 = currency
                        user.balance1 = "0.00"
                        users.save()
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

        if(amount&& name&& currency){
            let users = await User.findOne({
                where: {email:mail}
            })
            user = users.dataValues
            let recipient = await User.findOne({
                where: {email}
            })
            recipient = recipient.dataValues

            if(recipient.level == "Noob"){
                if(recipient.currency != user.currency){
                    let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${user.currency}&to=${recipient.currency}&amount=${amount}`)
                    let result = await red.json()
                    if(!result.info){
                        res.status(500).json({message: "An error occured in currency conversion "})
                        return
                    }
                    amount2 = result.info.rate
                }
            }else{
                if(currency !== recipient.currency){
                    if(recipient.currency1 && currency != recipient.currency1 ){
                        if(recipient.currency2 && currency != recipient.currency2){
                            if(recipient.currency3 && currency != recipient.currency3){
                                let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${recipient.currency}&amount=${amount}`)
                                let result = await red.json()
                                if(!result.info){
                                    res.status(500).json({message: "An error occured in currency conversio "})
                                    return
                                }
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
                    Transactions.create({userId: recipient.id, amount:amount2, credit:true, currency:currency, name,
                        createdAt: new Date(),updatedAt: new Date(), status: "pending", type:"receive" }).then(transe=>{
                            res.json({message: "Transaction successfully pending for approval", amount, username: user.firstName, sender: name, id:trans.id})
                    })
            })
            
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/sent',verifyAdmin, async(req,res)=>{
        let {id} = req.body
        
        if(id){
            let transe = await Transactions.findOne({where:{id}})
            trans = transe.dataValues
            if(trans){
                if(trans.recipientId){
                    let trans2e = await Transactions.findOne({where:{id: trans.recipientId}})
                    trans2 = trans2e.dataValues
                    await trans2e.update({status: "approved", approved:true,updatedAt: new Date() })
                    let user2e = await User.findOne({where:{id: trans2.userId}})
                    user2 = user2e.dataValues
                    if(user2.level == "Noob"){
                        user2.balance += trans2.amount
                        user2e.save()
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
                        user2e.save()
                    }
                }
                
                await transe.update({status: "approved", approved:true,updatedAt: new Date() })
                let user1e = await User.findOne({where:{id: trans.userId}})
                user1 = user1e.dataValues
                if(user1.level == "Noob"){
                    user1.balance -= trans.amount
                    user1e.save()
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
                    user1e.save()
                }
    
                res.json({message: "Transaction successfully pending for approval", amount: trans.amount, username: user.firstName,  id:trans.id})
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

        if(email && amount&& currency){
            let users = await User.findOne({
                where: {email}
            })
            user = users.dataValues
            if(user){
                if(user.level == "Noob"){
                    if(currency !== user.currency){
                        let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                        let result = await red.json()
                        if(!result.info){
                            res.status(500).json({message: "An error occured in currency conversio "})
                            return
                        }
                        amount = result.info.rate
                        
                    }
                
                }else{
                    if(currency !== user.currency){
                        if(user.currency1 && currency !== user.currency1 ){
                            if(user.currency2 && currency !== user.currency2){
                                if(user.currency3 && currency !== user.currency3){
                                    let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                                    let result = await red.json()
                                    amount = result.info.rate
                                }else{
                                    user.currency3 = currency
                                    user.balance3 = "0.00"
                                    users.save()
                                }
                            }else{
                                user.currency2 = currency
                                user.balance2 = "0.00"
                                users.save()
                            }
                        }else{
                            user.currency1 = currency
                            user.balance1 = "0.00"
                            users.save()
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
            let transe = await Transactions.findOne({where:{id}})
            trans = transe.dataValues
            if(trans){
                
                await transe.update({status: "approved", approved:true,updatedAt: new Date() })
                let user1e = await User.findOne({where:{id: trans.userId}})
                user1 = user1e.dataValues
                if(user1.level =="Noob"){
                    user1.balance -= trans.amount
                    user1e.save()
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
                    user1e.save()
                }
    
                res.json({message: "Transaction successful", amount:trans.amount, username: user.firstName, id:trans.id})
            }else{
                res.status(400).send({ message: 'Incorrect Id' })
            }

        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })

    app.post('/addcurrency', verify, async(req,res)=>{
        let email = req.user.email

        let users = await User.findOne({
            where: {email}
        })
        user = users.dataValues
        if(req.user.level !== "Noob"){
            if(!user.currency1){
                user.currency1 = req.body.currency
                user.balance1 = "0.00"
                users.save()
                res.json({message: "Second currency successfully added", currency: user.currency1})
            }else if(!user.currency2){
                user.currency2 = req.body.currency
                user.balance2 = "0.00"
                users.save()
                res.json({message: "Third currency successfully added", currency: user.currency2})
            }else if(!user.currency3){
                user.currency3 = req.body.currency
                user.balance23 = "0.00"
                users.save()
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

        let users = await User.findOne({
            where: {email}
        })
        user = users.dataValues
        if(user){
            user.level = level
            users.save()
            res.status(203).send({ message: 'User level updated' })
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })
    app.post('/listtransactions/pending', verifyAdmin, async(req,res)=>{

        let users = await Transactions.findAll({
            where: {approved:false}
        })
        if(users){
            res.status(200).send({ data: users.map(i=>i.dataValues)})
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })

    app.post('/listtransactions/all', verifyAdmin, async(req,res)=>{

        let users = await Transactions.findAll()
        user = users.dataValues
        if(users){
            res.status(200).send({ data: users.map(i=>i.dataValues)})
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })

    app.post('/listtransactions/verified', verifyAdmin, async(req,res)=>{

        let users = await Transactions.findAll({
            where: {approved:true}
        })
        if(users){
            res.status(200).send({ data: users.map(i=>i.dataValues)})
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })

    app.put('/changecurrency', verifyAdmin, async(req,res)=>{
        let {currency, email} = req.body

        let users = await User.findOne({
            where: {email}
        })
        user = users.dataValues
        if(user){
            user.currency = currency
            users.save()
            res.status(203).send({ message: 'User main currency updated' })
        }else{
            res.status(400).send({ message: 'Invalid user' })
        }
    })
    
    app.post('/directfund', verifyAdmin, async(req,res)=>{
        let {amount, currency, email} = req.body
        if(amount&& currency&& email){
            let users = await User.findOne({
                where: {email}
            })
            user = users.dataValues
            if(user){
                if(currency && currency !== user.currency){
                    let red = await fetch(`http://data.fixer.io/api/convert?access_key=${process.env.API}&from=${currency}&to=${user.currency}&amount=${amount}`)
                    let result = await red.json()
                    if(!result.info){
                        res.status(500).json({message: "An error occured in currency conversio "})
                        return
                    }
                    amount = result.info.rate
                    
                }
    
                Transactions.create({userId: user.id, amount, credit:true, currency: currency | user.currency,
                    createdAt: new Date(),updatedAt: new Date(), status: "approved",approved:true, type:"withdraw" }).then(trans=>{
                        user.balance = user.balance + amount
                        users.save()
                        res.json({message: "Transaction successful", amount, username: user.firstName, id:trans.id})
                })
                
            }else{
                res.status(400).send({ message: 'Invalid user' })
            }
        }else{
            res.status(400).send({ message: 'One or more missing inputs' })
        }
    })
}
