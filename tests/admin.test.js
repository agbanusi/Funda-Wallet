let server =require('../server.js')
//dev dependencies
let chai = require('chai')
let chaiHttp = require("chai-http")
let assert = chai.assert
chai.use(chaiHttp)
let firstName="admin", lastName="admin", email="admin@gmail.com", country="USA", password = '01234Admin', amount= 50, currency="USD"
let usermail = "johnagbanusi@gmail.com"
let token, id, id1, id2

describe('test the backend',()=>{
    describe('/register admin',()=>{
        it('register admin full details', (done)=>{
            chai.request(server)
            .post('/registeradmin')  
            .send({firstName, lastName, country, email, password})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                assert.isString(res.body.token,'success')
                token = res.body.token
                done();
            })
        })
        it('register admin missing details', (done)=>{
            chai.request(server)
            .post('/registeradmin')  
            .send({firstName, lastName, country, password})
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

    describe('login admin', ()=>{
        it('login admin full details', (done)=>{
            chai.request(server)
            .post('/loginadmin')  
            .send({email, password})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                assert.isString(res.body.token,'success')
                token = res.body.token
                done();
            })
        })
        it('login admin wrong details', (done)=>{
            chai.request(server)
            .post('/loginadmin')  
            .send({email, password:"password"})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

    describe("List all transactions",()=>{
        it("Verified admin", (done)=>{
            chai.request(server)
            .post('/listtransactions/all')  
            .send({token})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("Unverified admin", (done)=>{
            chai.request(server)
            .post('/listtransactions/all')  
            .send()
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })
    describe("List pending transactions",()=>{
        it("Verified admin", (done)=>{
            chai.request(server)
            .post('/listtransactions/pending')  
            .send({token})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                id1 = (res.body.data.filter(i=>i.credit==false)[0]).id
                id2 = (res.body.data.filter(i=>i.credit==false)[1]).id
                id = (res.body.data.filter(i=>i.credit==true)[0]).id
                done();
            })
        })
        it("Unverified admin", (done)=>{
            chai.request(server)
            .post('/listtransactions/pending')  
            .send()
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

    describe("credit a user",()=>{
        it("Verified admin", (done)=>{
            chai.request(server)
            .post('/fund')  
            .send({token, email:usermail, id})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified admin", (done)=>{
            chai.request(server)
            .post('/fund')  
            .send({email:usermail, id})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

    describe("debit an account",()=>{
        it("Verified admin", (done)=>{
            chai.request(server)
            .post('/withdraw')  
            .send({token, email:usermail, id:id1})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified user different currency", (done)=>{
            chai.request(server)
            .post('/withdraw')  
            .send({email:usermail, id:id1})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

    describe("Send money to users",()=>{
        it("Verified admin verifies transaction between users", (done)=>{
            chai.request(server)
            .post('/sent')  
            .send({token, id:id2})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified admin cannot verify transactions", (done)=>{
            chai.request(server)
            .post('/sent')  
            .send({id:id2})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })
    describe("Direct fund money to users",()=>{
        it("Verified admin sends money directly", (done)=>{
            chai.request(server)
            .post('/directfund')  
            .send({token, amount, currency, email:usermail})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified admin cannot send money directly", (done)=>{
            chai.request(server)
            .post('/directfund')  
            .send({amount, currency, email:usermail})
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

})