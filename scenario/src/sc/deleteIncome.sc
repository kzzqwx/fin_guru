theme: /

    state: DeletingIncome
        q!: (* ~Удалить* * | * ~Удалять* * | * Удали* *)
            (~Доход|~Прибыль)
            [с] [id | transaction id | ~идентификатор | ~номер ]
            $number::trId
        
        script:
            #log('deleteExpense: context: ' + JSON.stringify($context))
            initializeUser($request.channelUserId, $request.rawRequest.payload.character.name, $context);
            deleteIncome($parseTree._trId, $context);
        
        if: $request.rawRequest.payload.character.name === "Сбер"
            random:
                a: Удалил доход!
                a: Прибыль удалена!
                a: Готово!
        else:
            random:
                a: Удалила прибыль!
                a: Доход удален!
                a: Готово!
        buttons:
            "Помощь" -> ../Helping
        