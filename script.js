document.addEventListener('DOMContentLoaded', async function() {
    const tg = window.Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;

    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }

    let cart = [];
    let userBalance = 0;

    // Получаем баланс пользователя
    async function fetchBalance() {
        if (!userId) return 0;

        try {
            const response = await fetch(`/get_balance?user_id=${userId}`);
            if (!response.ok) throw new Error('Ошибка получения баланса');
            const data = await response.json();
            return data.balance || 0;
        } catch (error) {
            console.error('Error:', error);
            return 0;
        }
    }

    // Обновляем отображение баланса
    async function updateBalanceDisplay() {
        userBalance = await fetchBalance();
        document.getElementById('swimcoins-balance').textContent = userBalance;

        // Делаем кнопки неактивными, если баланс недостаточен
        document.querySelectorAll('.product-card').forEach(card => {
            const priceText = card.querySelector('.product-price').textContent;
            const price = parseInt(priceText.replace(/\D/g, ''));
            const button = card.querySelector('.add-to-cart');

            if (price > userBalance) {
                button.disabled = true;
                button.classList.add('disabled');
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
            }
        });
    }

    // Функция для обновления баланса на сервере
    async function updateBalance(newBalance) {
        if (!userId) return false;

        try {
            const response = await fetch('/update_balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    new_balance: newBalance
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    // Инициализация
    await updateBalanceDisplay();

    // Обработчики кнопок
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const priceText = productCard.querySelector('.product-price').textContent;
            const price = parseInt(priceText.replace(/\D/g, ''));

            if (price > userBalance) {
                alert('Недостаточно swimcoins!');
                return;
            }

            cart.push({
                name: productName,
                price: price,
                id: this.id
            });

            // Обновляем баланс
            userBalance -= price;
            document.getElementById('swimcoins-balance').textContent = userBalance;
            const success = await updateBalance(userBalance);

            if (!success) {
                alert('Ошибка обновления баланса!');
                return;
            }

            // Анимация
            this.textContent = '✓ Добавлено';
            this.classList.add('added-to-cart');

            setTimeout(() => {
                this.textContent = 'Добавить в корзину';
                this.classList.remove('added-to-cart');
            }, 2000);

            updateTelegramButton();
        });
    });

    // ... остальной код из предыдущего примера ...
});
/*let tg = window.Telegram.WebApp;

tg.expand();

let btn = document.querySelector('#click');
btn.onclick = () => {
    if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
    } else {
        tg.MainButton.setText("Вы выбрали сквиш");
        tg.MainButton.show();
    }
};*/


