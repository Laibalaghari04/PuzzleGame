import copy

goal_state = [[1, 2, 3],
              [4, 5, 6],
              [7, 8, 0]]

directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Up, Down, Left, Right


def manhattan(state):
    distance = 0
    for i in range(3):
        for j in range(3):
            val = state[i][j]
            if val != 0:
                target_x = (val - 1) // 3
                target_y = (val - 1) % 3
                distance += abs(target_x - i) + abs(target_y - j)
    return distance


def find_blank(state):
    for i in range(3):
        for j in range(3):
            if state[i][j] == 0:
                return i, j


class Node:
    def __init__(self, state, path, g):
        self.state = state
        self.path = path
        self.g = g
        self.h = manhattan(state)
        self.f = max(self.g + self.h, self.h)

    def __lt__(self, other):
        return self.f < other.f


def is_goal(state):
    return state == goal_state


def get_successors(node):
    x, y = find_blank(node.state)
    successors = []
    for dx, dy in directions:
        new_x, new_y = x + dx, y + dy
        if 0 <= new_x < 3 and 0 <= new_y < 3:
            new_state = copy.deepcopy(node.state)
            new_state[x][y], new_state[new_x][new_y] = new_state[new_x][new_y], new_state[x][y]
            successors.append(Node(new_state, node.path + [new_state], node.g + 1))
    return successors


def rbfs(node, f_limit):
    if is_goal(node.state):
        return node.path, 0

    successors = get_successors(node)
    if not successors:
        return None, float('inf')

    for s in successors:
        s.f = max(s.f, node.f)

    while True:
        successors.sort(key=lambda n: n.f)
        best = successors[0]

        if best.f > f_limit:
            return None, best.f

        alternative = successors[1].f if len(successors) > 1 else float('inf')
        result, best.f = rbfs(best, min(f_limit, alternative))
        if result is not None:
            return result, best.f


def solve(initial_state):
    start_node = Node(initial_state, [initial_state], 0)
    solution, _ = rbfs(start_node, float('inf'))
    return solution[1:] if solution else []  # exclude initial state
