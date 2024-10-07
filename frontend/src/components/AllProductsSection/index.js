import { useEffect, useState} from 'react'
import ProductCard from '../ProductCard'
import './index.css'
//import Cookies from 'js-cookie'
import axios from 'axios'
import CategoryList from '../CategoryList'

const AllProductsSection =()=>{
  const [productsList,setProductList] = useState([])
  const [searchInput,setSearchInput] = useState('')


  useEffect(()=>{
    const getProducts = ()=> {
      axios.get('https://flybuy-ecommerce-backend.onrender.com/getproducts')
      .then(res=>{//console.log(res.data)
        //let userDetails = JSON.parse(localStorage.getItem('userId'));
        //console.log(userDetails)
        
        setProductList(res.data)
        localStorage.setItem('products',JSON.stringify(res.data))
  
      })
      .catch(err=>{
        //console.log('All p')
        if (err.message ==='Network Error'){
          setProductList(JSON.parse(localStorage.getItem('products')))
         
         
        }
      })
      
  }
    getProducts()
  },[])
  

const onChangeSearchInput = (event) =>{
  setSearchInput(event.target.value)
  
}
const getCategory=(data)=>{
  //console.log(cat)
  setProductList(data)
}


const renderProductsList = () => {
    
    const searchResults= productsList.filter(eachproduct => (eachproduct.title).toLowerCase().includes(searchInput.toLowerCase()))
    return (
      <>
          
      <div className='all-products'>
        <h1 className="products-list-heading">Products</h1>     
        <input className="search-box"  placeholder="Search product here..." 
        type="search" value={searchInput} onChange={onChangeSearchInput}/>
        </div>
        {searchResults.length !== 0 &&
        <div>
        <ul className="products-list">
          {searchResults.map(product => (
            <ProductCard productData={product} key={product.id} />
          ))}
        </ul>
      </div>
  }
    
  {searchResults.length === 0 &&
  <>
  <div className='Not-Found'>
   
    <img src='notfound.gif' alt='not found'/>
    
    <div className='not-found-text'>
   
    <h5>Sorry No Product Available</h5>
    </div>
  </div>
  </>
  }
  
      </>
    )
  }

    //const {productsList} = this.state
    return (
    <>
    <CategoryList updateProductData={getCategory} />
    {renderProductsList()}
    </>
    );
  }


export default AllProductsSection
