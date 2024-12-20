
const express = require('express');
const sql = require('mysql2')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const dotenv = require('dotenv');
var orderIntance = require('./orderIntance.js');

const textflow = require("textflow.js");
textflow.useKey( process.env.TEXTFLOW_KEY);



const app = express()
app.use(cors())
app.use(express.json())
app.use('/',orderIntance)

const db = sql.createConnection({
    host: process.env.DB_HOST, 
    port:process.env.DB_PORT,
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
})


db.connect((err)=>{
    if (err){
        console.log(err)
    }
    else {
        console.log('connected')
    }
})

function keepAlive() { 
    console.log('re-connecting')
    db.ping();     
}
setInterval(keepAlive, 14400000); 

const createToken = (body) =>{
    return jwt.sign(body, 'pass')
}



app.get('/', (req,res) =>{
    return res.json("From Backed Side")
});

app.get('/getproducts', (req,res) =>{
    //console.log(req)
    const q = 'select * from products'
    db.query(q,(err,result)=>{
        //if(err) return res.json(err);
        //console.log(result)
        return res.json(result)

        })
});

app.post('/getCartList', (req,res) =>{
    //console.log(req.body)
    const q = 'select `title`,`brand`,`id`,`imageUrl`,`price`,`quantity` from products left join cartlist on id=productId where userId=(?)'
    db.query(q,[req.body.userId],(err,result)=>{
        
        console.log(result)
        return res.json(result)
        
        })
    

});

app.post('/login',async(req,res) =>{
    //console.log(req.body.username,req.body.password)

    const q='select * from users where BINARY `username`= ? and BINARY `password`= ?'
    
    db.query(q,[req.body.username,req.body.password],(err,result)=>{
        if(err) console.log(err)  //return res.json(err);
        //return res.json(result)
        console.log(result)
        if (result.length !==0){
            const jwt_token = createToken(req.body)
            res.send({'jwt':jwt_token,'userId':result[0].id})
        }
        else{
            res.status(400)
            res.send('Invalid User/Password')
        }
        })

});

app.post('/user',(req,res)=>{
    console.log(req.body)
    const q='select `username`,`mobile`,`email` from users where id=(?)'
    const values=[
        req.body.userId,
        
    ]
    db.query(q,[values],(err,result)=>{

        if(err) return res.status(500).json(err);
        console.log('user',result)
        return res.json(result)
        })
})
app.post('/data',(req,res)=>{
    console.log(req.body)
    const q = 'INSERT INTO users(`username`,`password`,`mobile`,`email`) VALUES(?)';
    const values = [
        req.body.username,
        req.body.password,
        req.body.mobile,
        req.body.email
    ]
    db.query(q,[values],(err,result)=>{
        console.log(err.message);
    if(err) return res.json(err.message) 
        
    return res.json(result)
    })
})
app.post('/getotp',(req,res)=>{
    console.log(req.body)
    const q='select `id` ,`username`,`password` from users where mobile=(?)'
    db.query(q,[req.body.mobile],(err,result)=>{
        console.log(result)
        
        if (result.length !==0){
            //res.send(result)
            const otp = otpGenerator.generate(6, {lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false });
            console.log(otp)
            
            
            textflow.sendSMS("+"+req.body.mobile, "Verification Code:"+String(otp),(otpResult) => {
                if (otpResult.ok) {
                    console.log('resul')
                    res.send({'data':{'username':result[0].username,'password':result[0].password},'otp':otp,'userId':result[0].id});
                }
                else{
                    res.status(500).json('Out of service, please try different method!')
                }
              })
              
              
        }
        else{
            res.status(400)
            res.send('Mobile is not registered SignUP first...')
        }
        })
    })

app.post('/verifyotp',(req,res)=>{
    console.log(req.body)
    const jwt_token = createToken(req.body)
    res.send({jwt_token})
    
})

app.post('/addToCart',(req,res)=>{
    //console.log(req.body)
    const qu = 'select productId, userId from cartlist where productId=(?) and userId=(?)'
    db.query(qu,[req.body.id,req.body.userId],(err,result)=>{
        //console.log(result)
        if(err) return res.json(err.message) //console.log(err.message);
        if (result.length === 0){
            //console.log('succed')
            const q = 'INSERT INTO cartlist VALUES(?)';
            const values = [
                req.body.id,
                req.body.quantity,
                req.body.userId,
            ]
            db.query(q,[values],(err,result)=>{
            if(err) return res.json(err.message) //console.log(err.message);
            //console.log(result) 
            return res.json(result)
            })
        }
        
        })

    
    
    
})

app.post('/removeallCartItme',(req,res)=>{
    //console.log(req.body)
    const q = 'delete from cartlist where userId=(?)'
    db.query(q,[req.body.userId],(err,result)=>{
        if(err) return res.json(err.message) //console.log(err.message);
        //console.log(result)
        
    })
})

app.post('/deleteCartItme',(req,res)=>{
    //console.log(req.body)
    const q = 'delete from cartlist where productId=(?) and userId=(?)'
    db.query(q,[req.body.id,req.body.userId],(err,result)=>{
        if(err) return res.json(err.message) //console.log(err.message);
        //console.log(result)
        res.json(result)
    })

})

app.post('/getItmesCount',(req,res)=>{
    //console.log(req.body)
    q='select count(productId) as count from cartlist where userId = (?)'
    db.query(q,[req.body.userId],(err,result)=>{
        if(err) return res.json(err.message) //console.log(err.message);
        //console.log(result[0])
        res.json(result[0])
    })
})

app.post('/getCartLists',(req,res)=>{
    console.log('hey')
    q='select productId from cartlist where userId = (?)'
    db.query(q,[req.body.userId],(err,result)=>{
        console.log('hey')
        if(err) return res.json(err.message) //console.log(err.message);
        console.log(result)
        res.json(result)
    })
})

app.post('/decrementCartItme',(req,res)=>{
    //console.log(req.body)
    const q = 'update cartlist set quantity=(?) where productId=(?) and userId=(?)'
    db.query(q,[req.body.quantity,req.body.id,req.body.userId],(err,result)=>{
        if(err) return res.json(err.message) //console.log(err.message);
        //console.log(result)
        res.json(result)
       
    })

})

app.post('/incrementCartItme',(req,res)=>{
    //console.log(req.body)
    const q = 'update cartlist set quantity=(?) where productId=(?) and userId=(?)'
    db.query(q,[req.body.quantity,req.body.id,req.body.userId],(err,result)=>{
        if(err) return res.json(err.message) //console.log(err.message);
        //console.log(result)
        res.json(result)
    })
})

app.post('/addAddress',(req,res)=>{
    console.log(Object.keys(req.body.address).map(function(key){return req.body.address[key]}))
    const values = Object.keys(req.body.address).map(function(key){return req.body.address[key]})
    const q = 'insert into address(`fullname`,`email`,`mobile`,`address`,`city`,`country`,`state`,`zip`,`userId`) values(?)'
    db.query(q,[values],(err,result)=>{
        //console.log(result)
        if(err) return res.status(500).json(err)
        res.json("OK")
    })
})

app.post('/getPrice',(req,res)=>{
    //console.log(req.body)
    q = 'select id, quantity, (price*quantity) as total, userId from cartlist inner join products on id = productId where userId =(?)'
    
    db.query(q,[req.body.userId],(err,result)=>{
        let Total_Price = 0
        const Price = result.map(itme => Total_Price=Total_Price+itme.total)
        res.json({'total_price':Total_Price,'data':result})
        //res.json(Total_Price)
        
    })
   
})

app.post('/addPurches',(req,res)=>{
    console.log(req.body.data.length)
    //console.log(Object.keys(req.body.data).map(function(key){return [req.body.data[key]]}))
    q="insert into purchesed_items(`productId`,`quantity`,`total_price`,`userId`) values ?"
    const values = []
        for (let i=0;i<req.body.data.length;i++){
            console.log(i)
            values.push(Object.keys(req.body.data[i]).map(function(key){return req.body.data[i][key]}))

        }
        console.log(values)
    db.query(q,[values],(err,result)=>{
        //console.log(result)
          
    })

    
})

app.post('/getpurcheseditems',(req,res)=>{
    console.log(req.body)
    q=' select itemId,id,title,brand,imageurl,purchesed_items.rating from products inner join purchesed_items on productId=id where userId=(?) order by itemId desc'
    db.query(q,[req.body.userId],(err,result)=>{
        console.log(result)
        res.json({'productData':result})
    })
})

app.post('/updaterating',(req,res)=>{
    console.log(req.body)
    q='update purchesed_items set rating=(?) where productId=(?) and itemId=(?) and userId=(?)'
    db.query(q,[req.body.rating,req.body.id,req.body.itemId,req.body.userId],(err,result)=>{
        console.log(result)
        q1='update products set rating=(select (sum(rating)/count(productId)) as rating from purchesed_items where productId=(?) and rating>0)  where id=(?);'
        db.query(q1,[req.body.id,req.body.id],(err,result)=>{
            console.log(result)})
    })
})

app.post('/getProductDetails',(req,res)=>{
    console.log(req.body)
    q='select  products.*, productdetails.productDescription from products left join  productdetails on products.id=productId where products.id =(?)'
    db.query(q,[req.body.id],(err,result)=>{
        res.json({'productDetails':result[0]})
    })
})


app.post('/getcategories',(req,res)=>{
    console.log(req.body)
    let q='select * from products where category=(?)'
    if(req.body.category==='all'){
        q='select * from products'
    }
    db.query(q,[req.body.category],(err,result)=>{
        console.log(result)
        res.json({'categoryData':result})
    })
})

app.listen(8081, ()=>{
    console.log(`app listening at http://localhost:8081`)

});

