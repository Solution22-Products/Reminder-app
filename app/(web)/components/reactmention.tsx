// components/TaskList.js

import { useState } from 'react';
import { MentionsInput, Mention } from 'react-mentions';

export default function TaskList() {
  const [tasks, setTasks] = useState([{ id: 1, inputValue: '' }]);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      { id: tasks.length + 1, inputValue: '' }, // Add a new task with a unique id
    ]);
  };

  const handleInputChange = (id : any, value : any) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, inputValue: value } : task
      )
    );
  };

  return (
    <div>
      <button onClick={handleAddTask}>Add Task</button>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {tasks.map(task => (
          <div key={task.id} style={{ flex: 1 }}>
            <MentionsInput
              value={task.inputValue}
              onChange={(e) => handleInputChange(task.id, e.target.value)}
              style={{
                minHeight: '50px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                width: '100%',
              }}
            >
              <Mention
                trigger="@"
                data={(search) => [
                  { id: '1', display: 'John Doe' },
                  { id: '2', display: 'Jane Doe' },
                ].filter(item => item.display.toLowerCase().includes(search.toLowerCase()))}
                markup="@[__display__]"
              />
            </MentionsInput>
          </div>
        ))}
      </div>
    </div>
  );
}
