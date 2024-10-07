/* eslint-disable */
import './index.css'
//import CartContext from '../../context/CartContext'
import React ,{useContext} from 'react'
import axios from 'axios';

import { ProductCountContext } from '../../context/ProductCountContext';
import { Link } from 'react-router-dom';


const ProductCard = (props)=>{
  const {productData} = props
  //console.log(props)
  const {productCount,updateProductCount} = useContext(ProductCountContext)

 
  
  
  const handleAddToCart = (id) => {
    //console.log(id)
    axios.post('https://flybuy-ecommerce-backend.onrender.com/addToCart',{'id':id,'quantity':1,'userId':JSON.parse(localStorage.getItem('userId'))})
    .then(()=>{
      //console.log(productCount)
      updateProductCount(productCount+1)
      //console.log('up',productCount)
    })
  };  
    return(
      <div className="products-container">
        <Link to={`/products/${productData.id}`} className="link-item">
      <li className="product-item">
        <img src={productData.imageUrl} alt="product" className="thumbnail" />
        <h1 className="title">{productData.title}</h1>
        <div className="rating-container">
            <p className="rating">{productData.rating}</p>
            <img
              src="https://assets.ccbp.in/frontend/react-js/star-img.png"
              alt="star"
              className="star"
            />
          </div>
        <p className="brand">by {productData.brand}</p>
        
        <div className="product-details">
          <p className="price">Rs {productData.price}/-</p>

         </div>
      </li>
      </Link>
      <button className='addtocartBtn gradient-button-2' onClick={()=>handleAddToCart(productData.id)}>ADD TO CART</button>
      </div>
    )
  }

export default ProductCard

  

