// ===== AI DETECTIVE GAME — LEVEL DATA =====

const LEVELS = [
  {
    id: 1,
    title: "The Museum Heist",
    subtitle: "A diamond vanishes from a locked exhibit",
    difficulty: 1,
    timeLimit: 600,
    suspects: [
      {
        name: "Marcus Webb",
        role: "Security Guard",
        avatar: "💂",
        bg: "Works night shift, has access to all rooms. Has been employed at the museum for 6 years. Recently had a salary dispute with management."
      },
      {
        name: "Rosa Diaz",
        role: "Museum Cleaner",
        avatar: "🧹",
        bg: "Cleans after hours, was found near the diamond exhibit at 11:15 PM. Has keys to utility closets adjacent to the exhibit hall."
      },
      {
        name: "Victor Chen",
        role: "Visitor",
        avatar: "🧳",
        bg: "Last registered visitor of the day, a private art collector. Was seen lingering near the diamond case. Has a history of acquiring rare gems."
      }
    ],
    clues: [
      {
        name: "Security Log",
        icon: "📋",
        desc: "Entry record shows a 12-minute gap in Marcus Webb's patrol route at exactly the time of the theft.",
        hidden: false
      },
      {
        name: "Cleaning Cart",
        icon: "🧺",
        desc: "Found parked outside the diamond exhibit — Rosa's usual route doesn't include this wing on Tuesdays.",
        hidden: true
      },
      {
        name: "Broken Glass",
        icon: "🔍",
        desc: "The display case glass was shattered from the inside, not the outside — requires prior knowledge of the mechanism.",
        hidden: true
      },
      {
        name: "Visitor Bag",
        icon: "🎒",
        desc: "Victor Chen's bag scan shows a small electronic device — consistent with a glass-cutter tool.",
        hidden: true
      }
    ],
    criminal: "Victor Chen",
    puzzle: {
      q: "A thief enters a museum at 11:00 PM. The security guard patrols every 20 minutes. The cleaner works from 10 PM–2 AM. A visitor was signed in at 10:45 PM and never signed out. The diamond vanished between 11:00 PM and 11:20 PM. The case glass was broken from the INSIDE. Who had the knowledge AND opportunity?",
      opts: [
        "Marcus Webb (Security Guard)",
        "Rosa Diaz (Cleaner)",
        "Victor Chen (Visitor)",
        "An unknown outside intruder"
      ],
      answer: 2
    }
  },

  {
    id: 2,
    title: "The Vanishing Scientist",
    subtitle: "Dr. Reeves disappears from a locked laboratory",
    difficulty: 2,
    timeLimit: 480,
    suspects: [
      {
        name: "Dr. Sarah Lin",
        role: "Research Partner",
        avatar: "👩‍🔬",
        bg: "Had full access to the lab and knew Dr. Reeves' daily schedule. Recently had a heated argument with Reeves over research credit. Her keycard shows entry at 6:00 PM."
      },
      {
        name: "James Horner",
        role: "Lab Technician",
        avatar: "🔬",
        bg: "Claims he left at 5:30 PM but his keycard shows entry at 6:30 PM with NO exit recorded. Was overheard on a phone call promising 'results by tonight'."
      },
      {
        name: "Agent Novak",
        role: "Corporate Spy",
        avatar: "🕵️",
        bg: "Identified on security cameras attempting entry at 6:00 PM but was denied access. Works for a competing pharmaceutical company. Has motive but no access."
      }
    ],
    clues: [
      {
        name: "Deleted Files",
        icon: "💾",
        desc: "Critical research data was wiped from the lab computer at 6:47 PM — same time as the disappearance.",
        hidden: false
      },
      {
        name: "Two Coffee Cups",
        icon: "☕",
        desc: "Two coffee cups found in the lab. Only one person was supposed to be there after 6 PM according to the schedule.",
        hidden: true
      },
      {
        name: "Keycard Anomaly",
        icon: "🔑",
        desc: "James Horner's keycard shows entry at 6:30 PM with absolutely no exit record. The door was locked from inside.",
        hidden: true
      },
      {
        name: "Chemical Trace",
        icon: "🧪",
        desc: "An unusual sedative compound — not part of any experiment — was found in one of the coffee cups.",
        hidden: true
      }
    ],
    criminal: "James Horner",
    puzzle: {
      q: "A lab has 3 keycard readers. Dr. Lin entered at 6:00 PM and exited at 6:15 PM. James Horner entered at 6:30 PM with NO exit record. Agent Novak was denied entry at 6:00 PM (never entered). Dr. Reeves disappeared at 6:45 PM. A sedative was found in a coffee cup. Who was physically present at the time of disappearance AND had motive?",
      opts: [
        "Dr. Sarah Lin (Research Partner)",
        "James Horner (Lab Technician)",
        "Agent Novak (Corporate Spy)",
        "Dr. Reeves left voluntarily"
      ],
      answer: 1
    }
  },

  {
    id: 3,
    title: "The Cyber Heist",
    subtitle: "$4.2 million vanishes from a bank server",
    difficulty: 3,
    timeLimit: 360,
    suspects: [
      {
        name: "Zara Kim",
        role: "Bank IT Admin",
        avatar: "💻",
        bg: "Has root-level access to all bank systems. Claims she was on vacation during the breach but VPN records tell a different story. Reported the breach 6 hours late."
      },
      {
        name: "Felix Drake",
        role: "External Auditor",
        avatar: "📊",
        bg: "Audited the bank the previous week and had temporary system credentials. His access officially expired 3 days before the breach. Was paid an unusually large 'consulting fee' recently."
      },
      {
        name: "The Phantom",
        role: "Unknown Hacker",
        avatar: "👾",
        bg: "An anonymous threat actor whose signature was found in the logs — but the IP address traces back to Terminal 7 inside the bank building itself. Possibly a false flag."
      }
    ],
    clues: [
      {
        name: "Server Logs",
        icon: "🖥️",
        desc: "The $4.2M transfer was initiated from Terminal 7 — the IT Admin workstation. Timestamp: 2:17 AM.",
        hidden: false
      },
      {
        name: "VPN Records",
        icon: "🔐",
        desc: "Zara Kim's admin credentials were used to log in from INSIDE the bank building at 2:15 AM — while she claims to have been in another city.",
        hidden: true
      },
      {
        name: "Audit Trail",
        icon: "📁",
        desc: "File timestamps on 47 system logs were modified retroactively — someone with admin privileges tried to cover their tracks.",
        hidden: true
      },
      {
        name: "Transfer Route",
        icon: "💰",
        desc: "The $4.2M was routed through 3 offshore accounts. The final domestic account was opened 2 weeks ago under a shell company linked to a known associate.",
        hidden: true
      }
    ],
    criminal: "Zara Kim",
    puzzle: {
      q: "A bank transfer of $4.2M was executed at 2:17 AM using IT Admin credentials. The admin claims she was 400 miles away on vacation. VPN logs show her credentials used from Terminal 7 INSIDE the building at 2:15 AM. The external auditor's access expired 3 days prior. 'The Phantom' signature matches the Admin's known coding style. Who executed the transfer?",
      opts: [
        "Zara Kim (IT Admin)",
        "Felix Drake (External Auditor)",
        "The Phantom (Unknown Hacker)",
        "An automated scheduled script"
      ],
      answer: 0
    }
  }
];
