theme: /

    state: AddingIncomeTitle
    
        q!: (* ~Добавить* * | * ~Создать* * | * ~Сделать* * | * Добавь* *)
            (~Доход|~Прибыль)
            $AnyText::anyText
        
        if: $request.rawRequest.payload.character.appeal === "official"
            random:
                a: Отлично! А сейчас назовите, пожалуйста, полученную сумму. Сумма может быть только положительной! 

        else:
            random:
                a: Отлично! Скажи сумму дохода. Она может быть только положительной!
                a: Принято! Назови полученную сумму, осторожно, ведь она может быть только положительной!
        
        script: 
            if (!$session.income) $session.income = {}
            $session.income.name = $parseTree._anyText;
            initializeUser($request.channelUserId, $request.rawRequest.payload.character.name, $context);
            #addSuggestions(["Другое"], $context);
        buttons:
            "Помощь" -> ../Helping
        
        
        state: AddingIncomeAmount
    
            q: $number::summa [рублей | евро | долларов | юаней | * ]
                        
            if: $request.rawRequest.payload.character.appeal === "official"
                random:
                    a: Отлично! А сейчас назовите, пожалуйста, дату получения средств. 
                    a: Хорошо! Скажите дату получения денежных средств. 
                    a: Когда вы получили прибыль? 
            else:
                random:
                    a: Отлично! Скажи дату дохода. 
                    a: Здорово! Когда была получена прибыль? 
                    a: Принято! Назови дату дохода. 
            
            script:
                $session.income.amount = $parseTree._summa;
            
            buttons:
                "Помощь" -> ../../Helping
        
                    
            state: AddingIncomeDate
    
                q: $DATETIME::day
                            
                if: $request.rawRequest.payload.character.appeal === "official"
                    random:
                        a: Отлично! Ваша прибыль добавлена!
                        a: Добавлено! 
                        a: Ваш доход был записан!
                else:
                    random:
                        a: Супер! Добавила твой доход!
                        a: Записала твою прибыль! 
                        a: Принято!
                
                script:
                    $session.income.date = $parseTree._day;
                    var name = $session.income.name;
                    var amount = $session.income.amount;
                    var date = $session.income.date;
                    addIncome(name, 1, date, amount, $context);
                    $jsapi.log("Осталось промокодов: " + $session.expense);
                buttons:
                    "Помощь" -> ../../../Helping
        
                go: /
                    
            
            
