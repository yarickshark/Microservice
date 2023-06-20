const client = require('../database_get')


class UserController {
    
  async createUserGen(req, res) {
    try {
        
      // Запрос для отримання максимального значення "merchant_id" з бази даних
      const query = 'SELECT MAX(merchant_id) AS max_merchant_id FROM merchants';
      const result = await client.query(query);
  
      let merchantId = '00'; // Значення по замовчуванню, якщо база даних порожня
      if (result.rows.length > 0 && result.rows[0].max_merchant_id !== null) {
        // Якщо є попереднє значення, обчислюємо наступне двозначне значення
        const previousMerchantId = result.rows[0].max_merchant_id;
        const nextMerchantId = generateNextId(previousMerchantId);
        merchantId = nextMerchantId;
      }
  
      // Вставляємо нову строку в базу даних із згенерованими значеннями
      const insertQuery = 'INSERT INTO merchants (merchant_id, terminal_id) VALUES ($1, $2)';
      const terminalId = `${merchantId}0`; // Генеруємо трьохзначне значення "terminal_id"
      await client.query(insertQuery, [merchantId, terminalId]);
  
      // Відправляємо успішну відповідь із зсгенерованим значенням "merchant_id"
      res.status(200).json({ merchantId });
    } catch (error) {
      // Якщо виникла помилка, відправляємо помилку клієнту
      res.status(500).json({ error: 'Internal server error' });
    } finally {
    }
  
// Функція для генерації наступного двозначного значення
function generateNextId(previousId) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let nextId = '';

  // Розбиваємо попереднє значення на символи
  const firstChar = previousId.charAt(0);
  const secondChar = previousId.charAt(1);

  // Визначаємо позицію символів в алфавіті
  const firstIndex = alphabet.indexOf(firstChar);
  const secondIndex = alphabet.indexOf(secondChar);

  // Генеруємо наступні позиції
  let nextFirstIndex = firstIndex;
  let nextSecondIndex = secondIndex + 1;

  // Якщо дійшли до кінця алфавіта для другого символа, переходимо до наступного символа
  if (nextSecondIndex === 36) {
    nextFirstIndex = firstIndex + 1;
    nextSecondIndex = 0;
  }

  // Якщо дійшли до кінця алфавіта для обох символів, переходимо до наступних символів
  if (nextFirstIndex === 36) {
    nextFirstIndex = 1;
    nextSecondIndex = 1;
  }

  // Составляемо наступні двозначні значення
  nextId = alphabet.charAt(nextFirstIndex) + alphabet.charAt(nextSecondIndex);

  return nextId;
}
}


  async genTerminal(req, res) {
    try {
      const { merchant_id } = req.body;
  
      // Знайти значення "merchant_id" та "terminal_id" у таблиці "merchants"
      const merchantQuery = 'SELECT terminal_id FROM merchants WHERE merchant_id = $1';
      const merchantResult = await client.query(merchantQuery, [merchant_id]);
      const terminal_id = merchantResult.rows[0].terminal_id;
  
      // Отримати перші два символи значення "terminal_id" з таблиці "terminals"
      let previousTerminal_id = terminal_id.substring(0, 2);
  
      // Отримати наступне значення для третього символа "terminal_id" від 0 до 9
      const nextDigitQuery = 'SELECT terminal_id FROM terminals WHERE merchant_id = $1 ORDER BY terminal_id DESC LIMIT 1';
      const nextDigitResult = await client.query(nextDigitQuery, [merchant_id]);
      let nextDigit = 0;
      if (nextDigitResult.rows.length > 0) {
        const lastTerminal_id = nextDigitResult.rows[0].terminal_id;
        const lastDigit = parseInt(lastTerminal_id.substring(2, 3), 10);
        nextDigit = (lastDigit + 1) % 10;
      }
  
      // Формування нового значення "terminal_id"
      const newTerminal_id = previousTerminal_id + nextDigit;
  
      // Перевірка на унікальність нового значення "terminal_id" в таблиці "terminals"
      const checkQuery = 'SELECT COUNT(*) AS count FROM terminals WHERE terminal_id = $1';
      const checkResult = await client.query(checkQuery, [newTerminal_id]);
      const count = checkResult.rows[0].count;
  
      if (count > 0) {
        throw new Error('Знайдено повторювання значення "terminal_id"');
      }
  
      // Занесення значень в таблицю "terminals"
      const insertQuery = 'INSERT INTO terminals (merchant_id, terminal_id) VALUES ($1, $2)';
      await client.query(insertQuery, [merchant_id, newTerminal_id]);
  
      res.status(200).json({ message: 'Запис успішно додана в таблицю terminals' });
    } catch (error) {
      console.error('Помилка:', error);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  }
    
      async getTerminals(req, res) {
        const users = await client.query('Select * from terminals')
        console.log('terminals')
        res.json(users.rows)
      }

        async createUser(req, res) {
          const {merchant_id, terminal_id, mer_name} = req.body
          const newPerson = await client.query('INSERT INTO merchants (merchant_id, terminal_id, mer_name) values ($1, $2, $3) RETURNING *', [merchant_id, terminal_id, mer_name])
          res.json(newPerson.rows[0])
    }

    async getUsers(req, res) {
        const users = await client.query('Select * from merchants')
        console.log('users')
        res.json(users.rows)
    }
    async getOneUser(req, res) {
        const id = req.params.id
        const users = await client.query('Select * from merchants where id = $1', [id])
        res.json(users.rows[0])
    }
    async updateUser(req, res) {
        
    }
    async deleteUser(req, res) {
        const id = req.params.id
        const user = await client.query('DELETE FROM merchants where id = $1', [id])
        res.json(user.rows[0])
    }
}

module.exports = new UserController()