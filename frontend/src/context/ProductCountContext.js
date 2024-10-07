import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

const ProductCountContext = createContext();

const ProductCountProvider = ({ children }) => {
  //const [productsIds,setProductsIds] = useState([])
  const [productCount, setProductCount] = useState(0);
  try{
  useEffect(()=>{
    axios.post('https://flybuy-ecommerce-backend.onrender.com/getCartList', {'userId':localStorage.getItem('userId')})
    .then(res=>{
        //const ids = ('map',res.data.map(itme=>parseInt(itme.productId)))
        //updateProducts(res.data.map(itme=>parseInt(itme.productId)))
        updateProductCount(res.data.length)

    })
    .catch(err=>{
      
      if (err.message ==='Network Error'){
        
      }
    })
    
  },[productCount])
  

  }
  catch (error){
    //console.log(error)
  
  }
  
   

  
    

  const updateProductCount = (c) => {
    //console.log('count',count)
    setProductCount(c);
    
  
  };
  //countdata = countdata+productCount

  //console.log('prcount',productCount)

  return (
    <ProductCountContext.Provider value={{ productCount, updateProductCount }}>
      {children}
    </ProductCountContext.Provider>
  );
};

export { ProductCountContext, ProductCountProvider };
