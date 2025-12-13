const db = require('../config/db');

class Meal {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM meals WHERE is_active = 1 ORDER BY meal_type');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM meals WHERE id = ? AND is_active = 1', [id]);
    return rows[0];
  }

  static async create(mealData) {
    const [result] = await db.execute(
      'INSERT INTO meals (meal_type, meal_name, description, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [mealData.meal_type, mealData.meal_name, mealData.description, mealData.start_time, mealData.end_time]
    );
    return result.insertId;
  }

  static async update(id, mealData) {
    const fields = [];
    const params = [];

    Object.keys(mealData).forEach(key => {
      if (mealData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(mealData[key]);
      }
    });

    params.push(id);
    const [result] = await db.execute(
      `UPDATE meals SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'UPDATE meals SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getActiveMeals() {
    const [rows] = await db.execute(
      'SELECT * FROM meals WHERE is_active = 1 ORDER BY FIELD(meal_type, "breakfast", "lunch", "dinner")'
    );
    return rows;
  }
}

module.exports = Meal;