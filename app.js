var budgetController =(function(){
    
    var Expense= function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentages = function(totalIncome){
        debugger;
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100) ;
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income= function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data={
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return{
        addItem: function(type, des, val){
            var newItem, ID;
            
            if(data.allItems[type].length>0){
             ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID=0;
            }
            
            if(type ==='exp'){
               newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
               newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
               data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budhet: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
        
        calculatePercentage: function(){
            debugger;
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentages(data.totals.inc);
            });
            
        },
        
        getPercentage: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            
            return allPercentages;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },
        
        testFunc: function(){
            console.log(data);
        }
    }
    
})();

var UIController = (function(){
    
    var DOMstrings={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        debugger;
            var numSplit, integer, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            
            integer = numSplit[0];
            
            if(integer.length > 3){
               integer = integer.substr(0,integer.length -3) + ',' + integer.substr(integer.length -3, integer.length);
            }
            dec = numSplit[1];
            
            
            return (type == 'exp' ?  '-' : '+') + ' ' + integer + '.' + dec;
        };
        
      var nodeListForEach = function(list, callback){
            for(var i = 0; i< list.length; i++){
                callback(list[i], i);
            }
        }; 
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        displayMonth: function(){
            var now, year, month, months;
            
            now = new Date();
            
            month = now.getMonth();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent =  months[month] + ' ' + year;
            
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red') ;
        },
        
        getDomStrings: function(){
            return DOMstrings;
        }, 
        
        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            fieldsArr= Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc': 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLable).textContent = '---';
            }
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            //Create HTML string with placeholder text
            if(type==='inc'){
                element= DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                 element= DOMstrings.expensesContainer;
                
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description% rent</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with some actual data
               newHtml = html.replace('%id%', obj.id);
               newHtml = newHtml.replace('%description%', obj.description);
               newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
           
        }
    }
})();

var controller = (function(budgetCtr, UICtr){
    
    var setupEventListeners = function(){
        var DOM = UICtr.getDomStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
               ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType)
    };
    
    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtr.calculateBudget();
        
        //2. Return the budget
       var budget = budgetCtr.getBudget();
        
        
        //3. Display the budget on the UI
       UICtr.displayBudget(budget);
        
    };
    
    var updatePercentages = function(){
        //1. Calculate percentages
        budgetCtr.calculatePercentage();
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtr.getPercentage();
        
        //3. Update the UI with the new percentages
        UICtr.displayPercentages(percentages);
    };
   
    var ctrlAddItem = function(){
        var input, newItem;
        
        //1. Get the field input data
        input= UICtr.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
        newItem = budgetCtr.addItem(input.type, input.description, input.value);
        
        //3. Add the item to the UI
        UICtr.addListItem(newItem, input.type);
        
        //4. Clear the fields
        UICtr.clearFields();
        
        //5. Calculate and update budget
        updateBudget();
            
        //6. Calculate and update percentages
            updatePercentages();
        }
    };
   
    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, Id;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            Id= parseInt(splitId[1]);
            
            //1. Delete the item from the data structure
            budgetCtr.deleteItem(type, Id);
            
            //2. Delete the item from the UI
            UICtr.deleteListItem(itemId);
            
            //3. Update and show the new budget
            updateBudget();
            
            //4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return{
        init: function(){
            UICtr.displayMonth();
           UICtr.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
                });
            
           setupEventListeners(); 
        }
    };
})(budgetController, UIController);

controller.init();