process.env.NODE_ENV='development'
let server = "http://localhost:5000"
//dev dependencies
let chai = require('chai')
let chaiHttp = require("chai-http")
let assert = chai.assert
chai.use(chaiHttp)
let firstName="admin", lastName="admin", email="admin@gmail.com", country="USA", password = 'admin'
let token

describe('test the backend',()=>{
    describe('/register admin',()=>{
        it('register admin full details', (done)=>{
            chai.request(server)
            .post('/registeradmin')  
            .send({firstNname, lastName, country, email, password})
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
            .send({token})
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
                done();
            })
        })
        it("Unverified admin", (done)=>{
            chai.request(server)
            .post('/listtransactions/pening')  
            .send({token})
            .end((err,res)=>{
                assert.equal(res.status,400,'successful')
                assert.isObject(res.body, 'an object is returned')
                done();
            })
        })
    })

})