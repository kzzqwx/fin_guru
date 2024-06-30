function get_request(context) {
    if (context && context.request)
        return context.request.rawRequest;
    return {}
}

function get_server_action(request){
    if (request &&
        request.payload && 
        request.payload.data &&
        request.payload.data.server_action){
            return request.payload.data.server_action;
        }
    return {};
}

function get_screen(request){
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state){
        return request.payload.meta.current_app.state.screen;
    }
    return "";
}

function get_selected_item(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state){
        return request.payload.selected_item;
    }
    return null;
}

function get_items(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.item_selector){
        return request.payload.meta.current_app.state.item_selector.items;
    }
    return null;
}

function get_id_by_selected_item(request){
    var items = get_items(request);
    var selected_item = get_selected_item(request);
    if (selected_item && items) {
        log('get_id_by_selected_item(): selected_item: '+toPrettyString(selected_item))
        if (items[selected_item.index]) {
            return items[selected_item.index].id
        }
    }
    return null;
}
function reply(body, response){
    var replyData = {
        type: "raw",
        body: body
    };    
    response.replies = response.replies || [];
    response.replies.push(replyData);
}


function addAction(action, context){
    var command = {
        type: "smart_app_data",
        action: action
    };
    for (var index = 0; context.response.replies && index < context.response.replies.length; index ++) {
        if (context.response.replies[index].type === "raw" &&
            context.response.replies[index].body &&
            context.response.replies[index].body.items
        ) {
            context.response.replies[index].body.items.push({command: command});
            return;
        }
    }
    
    return reply({items: [{command: command}]}, context.response);
}


function addSuggestions(suggestions, context) {
    var buttons = [];
    
    suggestions.forEach (function(suggest) {
        buttons.push(
            {
                action: {
                    text: suggest,
                    type: "text"
                },
                title: suggest
            }
        );
    });
    
    // for (var index = 0; context.response.replies && index < context.response.replies.length; index ++) {
    //     if (context.response.replies[index].type === "raw" &&
    //         context.response.replies[index].body
    //     ) {
    //         log("IN")
    //         context.response.replies[index].body.suggestions = {buttons: buttons};
    //         return;
    //     }
    // }

    reply({"suggestions": {"buttons": buttons}}, context.response);
}