import React from 'react';
import { useToast, Button} from '@salutejs/plasma-ui';
import { IconHelpCircleOutline } from '@salutejs/plasma-icons';

export const ToastForm = () => {
    const { showToast } = useToast();

    const handleHelpClick = () => {
        showToast({
            text: 'Для изменения (добавления, удаления) данных в списках (расходы, доходы) необходимо заполнить каждое поле в соответствующей форме',
            position: 'top',
            role: 'status',
            timeout: 3000,
            fade: "true",
        });
    };

    return (
        <div>
            <Button pin="circle-circle" square  className="sn-section-item toast-button" onClick={handleHelpClick}>
                <IconHelpCircleOutline size="s" color="inherit" />
            </Button>
        </div>
    );
};
