import React from 'react';
import { Button, ParagraphText1 } from '@salutejs/plasma-ui';
import { IconHelpCircleOutline } from '@salutejs/plasma-icons';
import styled from 'styled-components';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;`
;

const ModalContent = styled.div`
    background: black;
    padding: 8px;
    border-radius: 10px;
    margin-top: 6%; /* Отступ от верхнего края экрана */
    max-width: 90%;
    width: auto;` /* Ширина модального окна */
;

const CloseButton = styled(Button)`
    position: absolute;
    top: 8px;
    right: 8px;`
;

export function ToastForm() {
    const [isOpen, setIsOpen] = React.useState(false);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <div>
            <Button pin="circle-circle" square className="sn-section-item toast-button" onClick={() => setIsOpen(!isOpen)}>
                <IconHelpCircleOutline size="s" color="inherit" />
            </Button>
            {isOpen && (
                <Overlay>
                    <ModalContent>
                        <CloseButton pin="circle-circle" square onClick={close}>
                            ✕
                        </CloseButton>
                        <ParagraphText1>Для добавления данных в списки необходимо заполнить каждое поле в соответствующей форме</ParagraphText1>
                    </ModalContent>
                </Overlay>
            )}
        </div>
    );
}


