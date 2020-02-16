
// BUDGET CONTROLLER

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    }

    var data = {
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
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else {
                newItem = new Income(ID, desc, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spend
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
        }, 

        removeItem: function(type, id) {
            var items, selectedIdx;
            items = data.allItems[type];
            items.forEach(function(instance, index, arr) {
                if (instance.id === id) {
                    selectedIdx = index;
                }
            });
            items.splice(selectedIdx, 1);
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }

})();


// UI CONTROLLER
var uiController = (function () {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'     
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, el;

            // Create HTML 
            if (type === 'inc') {
                el = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                el = domStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholders with actual data
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', obj.value);

            // Insert the html into the dom
            document.querySelector(el).insertAdjacentHTML('beforeend', html);

        },

        removeListItem: function(itemId) {
            el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(domStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(domStrings.expensesLabel).textContent = obj.totalExpenses;
            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },

        getDOMStrings: function () {
            return domStrings;
        }
    }
})();


// APP CONTROLLER
var appController = (function (budgetCtrl, uiCtrl) {


    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget in the UI
        uiCtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            uiCtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Update the budget
            updateBudget();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemId, itemIdArr, type, id, bdgt;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            itemIdArr = itemId.split('-');
            type = itemIdArr[0];
            id = parseInt(itemIdArr[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.removeItem(type, id);

            // 2. Delete the item from the UI
            uiCtrl.removeListItem(itemId);
            
            // 3. Update and show the new budget
            budgetCtrl.calculateBudget();
            bdgt = budgetCtrl.getBudget();
            uiCtrl.displayBudget(bdgt);
        }
    }

    return {
        init: function () {
            console.log('Application has started.');
            uiCtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            })
            setupEventListeners();
        }
    }

})(budgetController, uiController);

appController.init();