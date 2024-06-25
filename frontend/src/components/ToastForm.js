import React from 'react';
import {Button, ParagraphText1} from '@salutejs/plasma-ui';
import { IconHelpCircleOutline } from '@salutejs/plasma-icons';
import { useToast, ToastProvider, Modal} from '@salutejs/plasma-web';
import styled from 'styled-components';

export function ToastForm() {
const [isOpen, setIsOpen] = React.useState(false);

    const close = React.useCallback(() => {
      setIsOpen(false);
    });

    return (
        <div>
             <Button pin="circle-circle" square  className="sn-section-item toast-button" onClick={() => setIsOpen(!isOpen)}>
                <IconHelpCircleOutline size="s" color="inherit" />
            </Button>
            <Modal isOpen={isOpen} onClose={close}>
                <ParagraphText1>Для добавления данных в списки необходимо заполнить каждое поле в соответствующей форме</ParagraphText1>
            </Modal>
        </div>
    );
};
