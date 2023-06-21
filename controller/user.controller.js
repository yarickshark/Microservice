const client = require('../database_get')


class UserController {
    
  async createUserGen(req, res) {
    const query = 'SELECT merchant_id FROM merchants ORDER BY merchant_id DESC LIMIT 1;';
  const result = await client.query(query);

  if (result.rows.length > 0) {
    const currentMerchantId = result.rows[0].merchant_id;
    let nextMerchantId;

    if (currentMerchantId === 'ZZ') {
      res.send('База даних заповнена');
      return;
    }

    if (currentMerchantId.length === 1) {
      nextMerchantId = incrementAlphanumeric(currentMerchantId);
    } else if (currentMerchantId.length === 2) {
      if (currentMerchantId[1] === 'Z') {
        nextMerchantId = incrementAlphanumeric(currentMerchantId[0]) + '0';
      } else {
        nextMerchantId = currentMerchantId[0] + incrementAlphanumeric(currentMerchantId[1]);
      }
    }

    const isUnique = await checkUniqueness(nextMerchantId);
    if (isUnique) {
      const insertQuery = `INSERT INTO merchants (merchant_id, terminal_id) VALUES ($1, $2);`;
      const terminalId = nextMerchantId + '0';
      await client.query(insertQuery, [nextMerchantId, terminalId]);

      res.send('Значення merchant_id успішно згенеровано і додано в базу даних.');
    } else {
      res.send('Помилка: merchant_id вже існує в базі даних.');
    }
  } else {
    // Якщо таблиця порожня, створюємо перший запис
    const initialMerchantId = '00';
    const initialTerminalId = '000';
    const insertQuery = `INSERT INTO merchants (merchant_id, terminal_id) VALUES ($1, $2);`;
    await client.query(insertQuery, [initialMerchantId, initialTerminalId]);

    res.send('Перше значення merchant_id успішно додано в базу даних.');
  }

// Функція для інкремента значення, що складається з літер та цифер
function incrementAlphanumeric(value) {
  const lastChar = value.slice(-1);
  let nextChar;

  if (lastChar === '9') {
    nextChar = 'A';
  } else if (lastChar === 'Z') {
    return '00'; // База даних заповнена
  } else {
    nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    if (nextChar === 'A') {
      nextChar = '0';
    }
  }

  return value.slice(0, -1) + nextChar;
}

// Функція для перевірки унікальності merchant_id
async function checkUniqueness(merchantId) {
  const query = 'SELECT COUNT(*) AS count FROM merchants WHERE merchant_id = $1;';
  const result = await client.query(query, [merchantId]);
  const count = parseInt(result.rows[0].count, 10);

  return count === 0;
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
