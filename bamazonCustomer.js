// notes. im stillworking on connection it to mysql turned out some of my t.cell code tables were incorrect and it whould not open the 
/// file up in the first place , i hope to update screenshots by aug 9 / 




var mysql = require('mysql');
var inquirer = require('inquirer');

// easy table package https://www.npmjs.com/package/easy-table color table /// https://www.npmjs.com/package/colors
 var Table = require('easy-table');
// var colors = require('colors');
var data =  'SELECT * FROM Products';

// for(var i = 0; i<res.length; i++){
//     console.log("ID: " + res[i].item_id +" | " + "Product: " + res[i].product_name +" | " + "Department: " + res[i].department_name +
// " | " + "Price: " + res[i].price +" | " + "Stock Quantity: " + res[i].stock_quantity + ""); // my friend sent me this code piece but it does not work for me 
// will just keep this snippet commented out  here incase i will need it for later.


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "root", 
    database: "Bamazon"
})
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});
// function to start purchasing 
function startpurchase() {
    // Display all the products
    var t = new Table;
   
    connection.query('SELECT * FROM Products', function(err, result) {
        if (err) throw err;
        console.log('\n<----------Welcome! Search for product to buy?---------->\n' .magenta.bold);

//The forEach() method executes a provided function once for each array element.


        result.forEach(function(itemTable) {
            t.cell('Product Id'.white , itemTable.ItemID)
            t.cell('Product'.white , itemTable.ProductName)
            t.cell('Department'.white , itemTable.DepartmentName)
            t.cell('Price'.white, itemTable.Price)
            t.cell('Quantity'.white, itemTable.StockQuantity)
            t.newRow()
        });
        console.log(t.toString());

        inquirer.prompt([{
            name: "getId",
            type: "input",
            message: "What is the ID of the product you would like to buy?".cyan,
            // validate the value if it is empty don't move to the next prompt
            validate: function(value) {
                if (isNaN(value) == false && parseInt(value) <= result.length && parseInt(value) > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "qty",
            type: "input",
            message: "How many units of the product you would like to buy?".red,
            validate: function(value) {
                if (isNaN(value) == false && parseInt(value) > 0) {
                    return true;
                } else {
                  // console.log("OPPS, looks like the quantity is unsuffitiant");
                    return false;

                }
            }
        }]).then(function(pick) {
            
            
            
            
            // store total as a variable===============================================================================
            var grandTotal = ((result[(pick.getId) - 1].Price) * parseInt(pick.qty)).toFixed(2);

            if (result[(pick.getId) - 1].StockQuantity >= parseInt(pick.qty)) {
                //after purchase, updates quantity in Products
                connection.query("UPDATE Products SET ? WHERE ?", [
                    { StockQuantity: (result[(pick.getId) - 1].StockQuantity - parseInt(pick.qty)) },
                    { ItemID: pick.getId }
                ], function(err, result) {
                    if (err) throw err;
                    console.log("\nSuccess! You will be charged $" + grandTotal + ".");
                    buyAgain();
                });
            } else {
                console.log("OPPS, looks like the quantity is unsuffitiant".red);
                buyAgain();
            }
        });
    });
}

//askign if person wants to make mroe puchases ===================================================
function buyAgain() {
    inquirer.prompt([{
        name: "more",
        type: "confirm",
        message: "buying more items?"
    }]).then(function(pick) {
        if (pick.more) {
            startpurchase();
        } else {
            console.log("\nThanks for shopping! Hope to see you again!".red);
        }
    });
}
startpurchase();