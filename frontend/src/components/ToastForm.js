import React from 'react';
import { useToast, Button, ActionButton } from '@salutejs/plasma-ui';
import { IconHelpCircleOutline } from '@salutejs/plasma-icons';

export const ToastForm = () => {
    const { showToast } = useToast();

    const handleHelpClick = () => {
        showToast({
            text: 'Для изменения (добавления, удаления, редактирования) данных в списках (расходы, доходы) необходимо заполнить каждое поле в соответствующей форме',
            position: 'top',
            role: 'status',
            timeout: 3000,
            fade: "true",
        });
    };

    return (
        <div>
            <ActionButton className={'sn-section-item'} onClick={handleHelpClick}><IconHelpCircleOutline size="s" color="inherit" /></ActionButton>
        </div>
    );
};
