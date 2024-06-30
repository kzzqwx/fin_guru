theme: /

    state: AddingExpenseTitle
    
        q!: (* ~Добавить* * | * ~Создать* * | * ~Сделать* * | * Добавь* * | * Запиши *)
            (~Расход|~Убыток|~Трата)
            $AnyText::anyText
        
        if: $request.rawRequest.payload.character.appeal === "official"
            random:
                a: Отлично! Теперь назовите сумму расхода. Принимаются только положительные числа.
                a: Хорошо! Скажите, пожалуйста, сумму расхода. Сумма расхода может быть только положительной.
                a: А теперь можете сказать сумму расхода. Сумма расхода может быть только положительной.
        else:
            random:
                a: Записано! Теперь можешь сказать сумму расхода. Осторожно, она может быть только положительной.
                a: Здорово! А какая сумма расхода? Осторожно, она может быть только положительной!
                a: Принято! Сейчас назови сумму расхода, она может быть только положительной!
        
        script: 
            if (!$session.expense) $session.expense = {}
            $session.expense.name = $parseTree._anyText;
            #initializeUser($request.channelUserId, $request.rawRequest.payload.character.name, $context);
            #addSuggestions(["Другое"], $context);

        buttons:
            "Помощь" -> ../Helping
        
            
        state: AddingExpenseAmount
    
            q: $number::summa [рублей | евро | долларов | юаней | *]
                        
            if: $request.rawRequest.payload.character.appeal === "official"
                random:
                    a: А сейчас назовите, пожалуйста, дату расхода. 
                    a: Хорошо! Скажите дату траты. 
                    a: Какая дата расхода? 
            else:
                random:
                    a: Отлично! Скажи дату расхода. 
                    a: Здорово! Когда была совершена трата? 
                    a: Принято! Назови дату траты. 
            
            script:
                $session.expense.amount = $parseTree._summa;
                
            buttons:
                "Помощь" -> ../../Helping
        
            
                    
            state: AddingExpenseDate
    
                q: $DATETIME::day
                            
                if: $request.rawRequest.payload.character.appeal === "official"
                    random:
                        a: Отлично! Ваш расход добавлен!
                        a: Добавлено! 
                        a: Ваш расход был записан!
                else:
                    random:
                        a: Супер! Добавила твой расход!
                        a: Записала твою трату! 
                        a: Принято!
                
                script:
                    $session.expense.date = $parseTree._day;
                    var expenseData = $session.expense;
                    var name = $session.expense.name;
                    var amount = $session.expense.amount;
                    var date = $session.expense.date;
                    addExpense(name, 1, date, amount, $context);
            
                    $jsapi.log("Осталось промокодов: " + $session.expense);
                
                buttons:
                    "Помощь" -> ../../../Helping
        

                go: /
                    
            
            
