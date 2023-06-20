# Microservice
Generating ID fof merchant


Мікросервіс, який при зверненні до одного з ендпоінтів генерує в базу даних merchant_id, та за іншим terminal_id для окремого мерчанта

відповідає умовам для генерування ключів:
В мерчантів буде 2 символи “XX”, які мають генеруватися за такими правилами: діставати з БД останні створені “мерчант id” і додавати наступну букву або цифру
Приклад: 01->09, 10->90, 0A->0Z, A0->Z0, AA->AZ, AA->ZA
У терміналу буде перші два значення останні 2 id мерчанта, а третє значення від 0 до 9

Створити БД під цей код можна так (використовувався PostgreSQL): 

CREATE TABLE merchants (
  id SERIAL PRIMARY KEY,
  merchant_id VARCHAR(2) UNIQUE,
  terminal_id VARCHAR(3)
);

CREATE TABLE terminals (
  merchant_id VARCHAR(2),
  terminal_id VARCHAR(3),
  FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);

Для з'єднання з базою даних PostgreSQL необхідно в файлі "database_get.js" вставити замість "your_password" - пароль до вашої бази даних, а замість "your_database" - назву вашої бази даних

Для запуску мікросервіса необхідно запустити файл "index.js" (очікується, що у вас вже встановлений NodeJS, npm та додаткові модулі Express та pg, вони вказані у файлі "package.json")

Перевірити доступ до ендпоінтів можна за допомогою Postman, та наступних ендпоінтів: 
GET http://localhost:3000/api/user - видає всю БД "merchants" 
GET http://localhost:3000/api/user/:id - видає інформацію тільки по одному мерчанту (замість ":id" вставити id мерчанта) 
GET http://localhost:3000/api/getterminal - видає БД "terminals" 
POST http://localhost:3000/api/user - додає мерчанта вказаного вручну JSONом, наприклад так: 
{ 
"merchant_id": "01", 
"terminal_id": "010"
} 
POST http://localhost:3000/api/genuser - генерує merchant_id та terminal_id, можна також додати ім'я мерчанта вказавши тіло: { "mer_name": "add" } 
POST http://localhost:3000/api/genterminal - генерує значення terminal_id в таблиці terminals, яке буде створене на основі попереднього значення terminal_id, потрібно лише вказати merchant_id до якого воно буде відноситись, наприклад: 
{ 
"merchant_id": "10" 
} 
DELETE http://localhost:3000/api/user/:id - видалити з БД запис про конкретного мерчанта (замість ":id" вказати id потрібного мерчанта)
