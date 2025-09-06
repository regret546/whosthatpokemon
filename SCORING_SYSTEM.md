# 🎯 Pokémon Guessing Game - Scoring System Documentation

## Overview

The scoring system uses a simple, transparent formula that rewards quick thinking and strategic gameplay while being easy for players to understand and calculate.

## 📊 Base Scoring Formula

```
Final Score = Base Score - Time Penalty - Hint Penalty + Difficulty Bonus + Streak Bonus
```

### 🔢 Formula Components

#### 1. **Base Score: 100 points**

- Every correct answer starts with **100 points**
- This is the foundation score before any modifications

#### 2. **Time Penalty: -2 points per second**

- **Formula**: `Time Penalty = Time Taken × 2`
- **Purpose**: Encourages quick thinking and decision-making
- **Examples**:
  - 5 seconds: -10 points
  - 15 seconds: -30 points
  - 30 seconds: -60 points

#### 3. **Hint Penalty: -10 points per hint**

- **Formula**: `Hint Penalty = Hints Used × 10`
- **Purpose**: Makes hint usage a strategic decision
- **Examples**:
  - 0 hints: -0 points
  - 1 hint: -10 points
  - 3 hints: -30 points

#### 4. **Difficulty Bonus**

- **Easy**: +0 points
- **Medium**: +10 points
- **Hard**: +20 points
- **Expert**: +30 points
- **Purpose**: Rewards players for choosing harder difficulties

#### 5. **Streak Bonus: +5 points per consecutive correct**

- **Formula**: `Streak Bonus = min(Streak Count × 5, 25)`
- **Maximum**: 25 points (5-streak cap)
- **Purpose**: Rewards consistent performance
- **Examples**:
  - 1 streak: +5 points
  - 3 streak: +15 points
  - 5+ streak: +25 points (capped)

#### 6. **Minimum Score Protection**

- **Guaranteed minimum**: 5 points for any correct answer
- **Purpose**: Ensures players always get rewarded for correct guesses

## 🎮 Scoring Examples

### Example 1: Quick Expert Player

```
Base Score:        100 points
Time (3 seconds):   -6 points
Hints Used (0):     -0 points
Difficulty (Expert): +30 points
Streak (2):         +10 points
Final Score:        134 points
```

### Example 2: Thoughtful Medium Player

```
Base Score:        100 points
Time (20 seconds): -40 points
Hints Used (2):    -20 points
Difficulty (Medium): +10 points
Streak (0):          +0 points
Final Score:         50 points
```

### Example 3: Struggling Easy Player

```
Base Score:        100 points
Time (28 seconds): -56 points
Hints Used (4):    -40 points
Difficulty (Easy):   +0 points
Streak (0):          +0 points
Calculated:          4 points
Final Score:         5 points (minimum protection)
```

### Example 4: Streak Master

```
Base Score:        100 points
Time (8 seconds):  -16 points
Hints Used (1):    -10 points
Difficulty (Hard):  +20 points
Streak (5):         +25 points
Final Score:        119 points
```

## 🎯 Strategic Implications

### **Time Management**

- **Fast answers** (under 10 seconds) preserve most of the base score
- **Moderate speed** (10-20 seconds) provides good score retention
- **Slow answers** (25+ seconds) significantly impact final score

### **Hint Usage Strategy**

- **No hints**: Maximum score potential
- **Strategic hints**: Use when time pressure might cause incorrect guess
- **Cost-benefit**: Each hint costs 10 points but may save you from 0 points

### **Difficulty Selection**

- **Expert players**: High risk, high reward (up to +30 bonus)
- **Learning players**: Easy mode focuses on learning without pressure
- **Balanced players**: Medium/Hard provide good challenge-to-reward ratio

### **Streak Building**

- **Consistency matters**: Building streaks provides significant bonus
- **Risk assessment**: Sometimes worth using hints to maintain streak
- **Long-term strategy**: 5+ correct answers in a row maximizes streak bonus

## 🔧 Technical Implementation

### **Score Calculation Location**

- **File**: `src/services/gameLogicService.ts`
- **Method**: `calculateScore()`
- **Timing**: Calculated when player submits correct answer

### **Hint Tracking**

- **Session tracking**: Each game session tracks `hintsUsed` count
- **Real-time updates**: Hint usage immediately increments counter
- **Reset behavior**: Counter resets to 0 for each new Pokémon

### **State Management**

- **Game Store**: Manages current game state and scoring
- **Session Service**: Handles persistent scoring across rounds
- **Automatic calculation**: No manual score calculation required

## 📈 Score Ranges by Performance

### **Excellent Performance (90-150+ points)**

- Quick guessing (under 10 seconds)
- No or minimal hint usage
- Higher difficulty levels
- Active streak building

### **Good Performance (50-90 points)**

- Moderate speed (10-20 seconds)
- Strategic hint usage (1-2 hints)
- Medium difficulty
- Some streak consistency

### **Learning Performance (5-50 points)**

- Slower guessing (20+ seconds)
- Heavy hint reliance (3+ hints)
- Easy/Medium difficulty
- Inconsistent streaks

## 🎲 Balancing Philosophy

### **Fairness**

- Every correct answer receives points (minimum 5)
- No punishment for incorrect answers (streak reset only)
- Clear, predictable scoring rules

### **Skill Reward**

- Speed and knowledge rewarded significantly
- Difficulty scaling provides appropriate challenges
- Streak system rewards consistency

### **Strategic Depth**

- Hint usage creates meaningful decisions
- Risk/reward balance in difficulty selection
- Multiple paths to high scores (speed vs. accuracy vs. consistency)

### **Accessibility**

- Simple math makes scores easy to understand
- No hidden multipliers or complex calculations
- Immediate feedback on score factors

---

_This scoring system promotes engaging, strategic gameplay while maintaining simplicity and fairness for all skill levels._
