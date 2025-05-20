from flask import Flask, render_template, request, jsonify
import main  # our main.py RBFS solver

app = Flask(__name__)

# Global solution steps storage per session (simplified, no user sessions)
solution_path = []
current_step = 0


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/solve', methods=['POST'])
def solve_puzzle():
    global solution_path, current_step
    data = request.json
    initial_state = data.get('state')

    if not initial_state or len(initial_state) != 3 or any(len(row) != 3 for row in initial_state):
        return jsonify({'error': 'Invalid puzzle state'}), 400

    # Solve the puzzle
    solution_path = main.solve(initial_state)
    current_step = 0

    if not solution_path:
        return jsonify({'error': 'No solution found'}), 400

    return jsonify({'steps': len(solution_path)})


@app.route('/next', methods=['GET'])
def next_step():
    global current_step, solution_path

    if current_step >= len(solution_path):
        return jsonify({'done': True})

    step = solution_path[current_step]
    current_step += 1
    return jsonify({'state': step, 'done': False})


@app.route('/reset', methods=['POST'])
def reset_steps():
    global current_step, solution_path
    current_step = 0
    solution_path = []
    return jsonify({'reset': True})


if __name__ == '__main__':
    app.run(debug=True)
