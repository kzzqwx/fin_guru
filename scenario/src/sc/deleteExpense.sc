theme: /

    state: DeletingExpense
        q!: (* ~Удалить* * | * ~Удалять* * | * Удали* *)
            (~Расход|~Убыток|~Трата)
            [с] [id | transaction id | ~идентификатор | ~номер ]
            $number::trId

        
        script:
            deleteExpense($parseTree._trId, $context);
            initializeUser($request.channelUserId, $request.rawRequest.payload.character.name, $context);
            #addSuggestions(["Удали расход Карандаши"], $context);

        if: $request.rawRequest.payload.character.name === "Сбер"
            random:
                a: Удалил расход!
                a: Трата удалена!
                a: Готово!
        else:
            random:
                a: Удалила трату!
                a: Расход удален!
                a: Готово!
        buttons:
            "Помощь" -> ../Helping
        

