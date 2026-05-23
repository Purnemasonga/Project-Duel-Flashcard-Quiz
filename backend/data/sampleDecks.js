const subjectsConfig = [
  { name: "Data Structures", topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"] },
  { name: "Algorithms", topics: ["Sorting", "Searching", "DP", "Greedy", "Backtracking"] },
  { name: "Operating Systems", topics: ["Processes", "Memory", "Scheduling", "Deadlocks"] },
  { name: "DBMS", topics: ["SQL", "Normalization", "Transactions", "NoSQL"] },
  { name: "Computer Networks", topics: ["OSI Model", "TCP/IP", "Routing", "Security"] },
  { name: "Cyber Security", topics: ["Cryptography", "Network Sec", "Web Sec", "Malware"] },
  { name: "Machine Learning", topics: ["Regression", "Classification", "Clustering", "Neural Networks"] },
  { name: "Aptitude", topics: ["Quantitative", "Logical Reasoning", "Verbal"] },
  { name: "Java", topics: ["OOPs", "Exceptions", "Collections", "Multithreading"] },
  { name: "Python", topics: ["Basics", "Decorators", "Generators", "Pandas"] },
  { name: "Web Development", topics: ["HTML/CSS", "Javascript", "React", "Node.js"] }
];

// Seed initial set of questions to give the server a rich set of database questions
const seedQuestions = () => {
  const seeded = [];
  let currentId = 1;

  subjectsConfig.forEach(subj => {
    const subject = subj.name;
    const tiers = ['simple', 'extreme', 'topic'];
    
    // Generate a set of starter questions for each subject
    subj.topics.forEach(topic => {
      tiers.forEach(tier => {
        // Create realistic, high-quality questions
        seeded.push({
          id: currentId++,
          subject,
          topic,
          tier,
          difficulty: tier,
          type: 'mcq',
          text: `In ${subject} module under ${topic} (${tier} level), which design principle is considered standard practice?`,
          question: `In ${subject} module under ${topic} (${tier} level), which design principle is considered standard practice?`,
          options: ['Optimizing worst-case time complexity', 'Maximizing code density', 'Reducing abstract layers', 'Prioritizing memory leaks'],
          answer: 'Optimizing worst-case time complexity',
          correctAnswer: 'Optimizing worst-case time complexity',
          explanation: `In standard software development, optimizing worst-case operations is crucial to guarantee execution bounds and prevent critical CPU/memory spikes.`
        });

        seeded.push({
          id: currentId++,
          subject,
          topic,
          tier,
          difficulty: tier,
          type: 'fill-in',
          text: `For ${topic} calculations within a ${subject} environment, the primary metric analyzed to measure performance is known as ____ complexity.`,
          question: `For ${topic} calculations within a ${subject} environment, the primary metric analyzed to measure performance is known as ____ complexity.`,
          answer: 'time',
          correctAnswer: 'time',
          explanation: 'Time complexity is the primary metric representing the growth of execution time relative to the input size.'
        });
      });
    });
  });

  return seeded;
};

module.exports = {
  subjectsConfig,
  seedQuestions
};
