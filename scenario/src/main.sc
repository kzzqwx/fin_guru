require: slotfilling/slotFilling.sc
  module = sys.zb-common
require: zenflow.sc
  module = sys.zfl-common
  
# Подключение javascript обработчиков
require: js/reply.js
require: js/actions.js

# Подключение сценарных файлов
require: sc/addExpense.sc
require: sc/addIncome.sc
require: sc/deleteExpense.sc
require: sc/deleteIncome.sc
require: sc/description.sc
require: sc/help.sc
  
patterns:
    $AnyText = * $nonEmptyGarbage *
    $number = @duckling.number

theme: /
    state: Start
        # При запуске приложения с кнопки прилетит сообщение /start.
        q!: $regex</start>
        
        # При запуске приложения с голоса прилетит сказанная фраза.
        q!: (* ~Запустить * * | * ~Активировать * * | * ~Открыть * * | * Запусти * * | * Активируй * * | * Открой * * | Навык)
            (Финансовый Гуру | Гуру финансов | Гуру расходов | Контроль финансов)
        buttons:
            "Список команд" -> ../Helping
            "О приложении" -> ../Description
        
        script:
            initializeUser($request.channelUserId, $request.rawRequest.payload.character.name, $context);
            
        if: $request.rawRequest.payload.character.name === "Джой"
            a:  Привет! Добро пожаловать в Финансовый Гуру, в приложении где ты можешь контролировать свои финансы! Для начала изучи список команд, а затем попробуй сказать "Запиши расход Поход в магазин". 
        else: 
            a: Приветствую Вас в Финансовый Гуру! Здесь Вы можете контролировать свои финансы. Для начала следует изучить список команд, затем попробуйте сказать "Запиши расход Овощи".
        
        
    state: Fallback
        event!: noMatch
        if: $request.rawRequest.payload.character.name === "Сбер"
            a: Я не понял, попробуйте сказать "добавь доход подарок"
        elseif: $request.rawRequest.payload.character.appeal === "official"
            a: Я не поняла, попробуйте сказать "добавь доход подарок"
        else:
            a: Я не поняла, попробуй сказать "добавь доход подарок"
        buttons:
            "Список команд" -> ../Helping
            "О приложении" -> ../Description
            
    state: UserHello
        q!: (Привет|Здравствуй|Здравствуйте)
        if: $request.rawRequest.payload.character.appeal === "official"
            a: Здравствуйте! Вы можете попросить меня записать расход или доход.
        else:
            a: Привет! Ты можешь попросить меня записать расход или доход.
            
        buttons:
            "Список команд" -> ../Helping
            "О приложении" -> ../Description
                
                