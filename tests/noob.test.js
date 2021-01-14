process.env.NODE_ENV='development'
let server = "http://localhost:5000"
//dev dependencies
let chai = require('chai')
let chaiHttp = require("chai-http")
let assert = chai.assert
chai.use(chaiHttp)
let firstName="admin", lastName="admin", email="admin@gmail.com", country="USA", password = 'admin', currency="USD", amount="50"
let token

describe('test the backend',()=>{
    describe('/register user',()=>{
        it('register user full details', (done)=>{
            chai.request(server)
            .post('/register')  
            .send({firstName, lastName, country, currency, email, password})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                assert.isString(res.body.token,'success')
                token = res.body.token
                done();
            })
        })
        it('register user missing details', (done)=>{
            chai.request(server)
            .post('/register')  
            .send({firstName, lastName, country, password})
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

    describe('login user', ()=>{
        it('login user full details', (done)=>{
            chai.request(server)
            .post('/login')  
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
            .post('/login')  
            .send({email, password:"password"})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

    describe("credit an account",()=>{
        it("Verified user same currency", (done)=>{
            chai.request(server)
            .post('/credit')  
            .send({token, amount, currency, name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("Verified user different currency", (done)=>{
            chai.request(server)
            .post('/credit')  
            .send({token, amount, currency:"JPY", name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified user different currency", (done)=>{
            chai.request(server)
            .post('/credit')  
            .send({amount, currency:"JPY", name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

    describe("debit an account",()=>{
        it("Verified user same currency", (done)=>{
            chai.request(server)
            .post('/debit')  
            .send({token, amount, currency, name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("Verified user different currency", (done)=>{
            chai.request(server)
            .post('/debit')  
            .send({token, amount, currency:"JPY", name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified user different currency", (done)=>{
            chai.request(server)
            .post('/debit')  
            .send({amount, currency:"JPY", name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

    describe('/register user',()=>{
        it('register another user full details', (done)=>{
            chai.request(server)
            .post('/register')  
            .send({firstName, lastName, country, currency, email:"johnjohn@gmail.com", password})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                assert.isString(res.body.token,'success')
                token = res.body.token
                done();
            })
        })
        it('register another user full details', (done)=>{
            chai.request(server)
            .post('/register')  
            .send({firstName, lastName, country, currency:"JPY", email:"johnjohnny@gmail.com", password})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                assert.isString(res.body.token,'success')
                token = res.body.token
                done();
            })
        })
    })

    describe("Send money to users",()=>{
        it("Verified user same currency", (done)=>{
            chai.request(server)
            .post('/send')  
            .send({token, amount, currency, name:"Datebayo industries", email:"johnjohn@gmail.com"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("Verified user different currency", (done)=>{
            chai.request(server)
            .post('/send')  
            .send({token, amount, currency:"JPY", name:"Datebayo industries", email:"johnjohnny@gmail.com"})
            .end((err,res)=>{
                assert.equal(res.status,200,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        it("unverified user different currency", (done)=>{
            chai.request(server)
            .post('/send')  
            .send({amount, currency:"JPY", name:"Datebayo industries"})
            .end((err,res)=>{
                assert.equal(res.status,400,'unsuccessful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
        
    })

})