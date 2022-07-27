//targeting all the dom elements with the 'fa-trash' class
const deleteBtn = document.querySelectorAll('.fa-trash')
//targeting all <span>s where the parent has a class of 'item'
const item = document.querySelectorAll('.item span')
//targeting all <span>s with a class of completed where the parent has a class of 'item'

const itemCompleted = document.querySelectorAll('.item span.completed')
// create an array from the querySelectorAll results, loop through, and add a click event listener that fires the deleteItem fuction
Array.from(deleteBtn).forEach((element)=>{
    element.addEventListener('click', deleteItem)
})
// create an array from the querySelectorAll results, loop through. and add a click event listener that fires the markComplete fuction
Array.from(item).forEach((element)=>{
    element.addEventListener('click', markComplete)
})
// create an array from the querySelectorAll results, loop through. and add a click event listener that fires the markUnComplete fuction
Array.from(itemCompleted).forEach((element)=>{
    element.addEventListener('click', markUnComplete)
})
//reverses the dom up to the parent li and gets the text inside of the first span element
//It is going to grab the first item inside the <li> with the class of 'completed' and delete it
async function deleteItem(){
    const itemText = this.parentNode.childNodes[1].innerText
    //try-catch is a cleaner way to handle errors, essentially error handling
    try{
        //sends a delete request to the 'deleteItem' endpoint, sets the headers to expect a json response, and the itemText variable contents in the body
        const response = await fetch('http://ourserver/deleteItem', {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              'itemFromJS': itemText
            })
          })
       //wait for response, prase json
          const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}

async function markComplete(){
    // nodes are html multi option tags 
    const itemText = this.parentNode.childNodes[1].innerText
    try{
        const response = await fetch('markComplete', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'itemFromJS': itemText
            })
          })
        const data = await response.json()
        console.log(data)
        //reload the page
        location.reload()

    }catch(err){
        console.log(err)
    }
}

async function markUnComplete(){
    const itemText = this.parentNode.childNodes[1].innerText
    try{
        const response = await fetch('markUnComplete', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'itemFromJS': itemText
            })
          })
        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}