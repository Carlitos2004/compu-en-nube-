/**
 * Report Controller
 * SRP: Maneja estadísticas, analíticas y exportaciones usando PostgreSQL
 */

const db = require('../src/config/db');
const PDFDocument = require('pdfkit'); // <-- Importamos la nueva librería

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const resultTotal = await db.query('SELECT COUNT(*) FROM tasks');
    const resultCompleted = await db.query('SELECT COUNT(*) FROM tasks WHERE completed = TRUE');

    const total = parseInt(resultTotal.rows[0].count);
    const completed = parseInt(resultCompleted.rows[0].count);
    const pending = total - completed;

    res.status(200).json({ total, completed, pending });
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/analytics/weekly
const getWeeklyAnalytics = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        EXTRACT(ISODOW FROM due_date) as day_index,
        COUNT(*) as task_count
      FROM tasks 
      WHERE due_date >= CURRENT_DATE - INTERVAL '7 days'
        AND due_date IS NOT NULL
      GROUP BY day_index
    `);

    const weeklyData = [
      { day: 'Lun', tasks: 0 }, { day: 'Mar', tasks: 0 }, { day: 'Mié', tasks: 0 },
      { day: 'Jue', tasks: 0 }, { day: 'Vie', tasks: 0 }, { day: 'Sáb', tasks: 0 }, { day: 'Dom', tasks: 0 }
    ];

    const dayNames = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };

    result.rows.forEach(row => {
      const dayIdx = parseInt(row.day_index);
      const dayName = dayNames[dayIdx];
      const dataPoint = weeklyData.find(d => d.day === dayName);
      if (dataPoint) dataPoint.tasks = parseInt(row.task_count);
    });

    res.status(200).json({ status: 'success', data: weeklyData });
  } catch (error) {
    console.error("Error cargando analíticas semanales:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/exports/tasks/csv
const exportTasksCSV = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY id ASC');
    const tasks = result.rows;

    const csvHeader = "ID,Titulo,Categoria,Completada\n";
    const csvRows = tasks.map(t => `${t.id},"${t.title}",${t.category},${t.completed}`).join('\n');
    const csvContent = csvHeader + csvRows;

    res.header('Content-Type', 'text/csv');
    res.attachment('mis_tareas_db.csv'); 
    res.send(csvContent);
  } catch (error) {
    console.error("Error exportando CSV:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/exports/tasks/pdf -> Genera un reporte visual en PDF de las tareas finalizadas
const exportTasksPDF = async (req, res) => {
  try {
    // 1. Buscamos solo las tareas completadas en la BD
    const result = await db.query('SELECT * FROM tasks WHERE completed = TRUE ORDER BY due_date DESC, id DESC');
    const completedTasks = result.rows;

    // 2. Creamos un nuevo documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // 3. Configuramos los headers para que el navegador sepa que es una descarga de PDF
    res.setHeader('Content-disposition', 'attachment; filename="reporte_tareas_completadas.pdf"');
    res.setHeader('Content-type', 'application/pdf');

    // 4. Conectamos el PDF directamente a la respuesta HTTP (Stream)
    doc.pipe(res);

    // 5. Diseñamos el contenido del PDF
    doc.fontSize(24).fillColor('#2c3e50').text('Reporte de Productividad', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#7f8c8d').text(`Generado el: ${new Date().toLocaleDateString('es-CL')}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#27ae60').text(`Total de tareas finalizadas: ${completedTasks.length}`);
    doc.moveDown();

    // Dibujamos una línea separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#bdc3c7').stroke();
    doc.moveDown();

    // Listamos cada tarea
    completedTasks.forEach((task, index) => {
      doc.fontSize(12).fillColor('#2c3e50').text(`${index + 1}. ${task.title}`);
      
      const dateStr = task.due_date ? new Date(task.due_date).toLocaleDateString('es-CL') : 'Sin fecha';
      doc.fontSize(10).fillColor('#7f8c8d').text(`Categoría: ${task.category} | Fecha límite: ${dateStr}`);
      
      if (task.notes) {
        doc.fontSize(10).fillColor('#95a5a6').text(`Notas: ${task.notes}`);
      }
      doc.moveDown();
    });

    // 6. Finalizamos el documento
    doc.end();

  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: 'Error interno del servidor generando el PDF' });
  }
};

module.exports = {
  getDashboardStats,
  getWeeklyAnalytics,
  exportTasksCSV,
  exportTasksPDF
};