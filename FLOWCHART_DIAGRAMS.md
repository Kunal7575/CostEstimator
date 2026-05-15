# 🎨 Complete Branched Architecture - Visual Flowcharts

## Architecture Overview Flowchart

```
                        ╔════════════════════════════════════════════════╗
                        ║           🎮 WELCOME SCREEN                   ║
                        ║          Let's Estimate Your Costs             ║
                        ║            "Get Started →"                     ║
                        └─────────────────┬──────────────────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │   Who are you? (Main Decision)    │
                        └──────┬──────────────┬──────────────┘
                               │              │
              ┌─ 🔵 ───────────┼─ 🔴 ───┬──── 🟢 ─────┐
              │                │        │              │
              │                │        │              │
    ┌─────────▼────────┐  ┌────▼──────┐│  ┌───────────▼──────┐
    │ PROSPECTIVE      │  │PROSPECTIVE││  │ CURRENT/RETURNING │
    │ DOMESTIC         │  │INTL       ││  │ DOMESTIC          │
    │ (~14 steps)      │  │(~16 steps)││  │ (~13 steps)      │
    └─────────┬────────┘  └────┬──────┘│  └───────────┬──────┘
              │                │       │              │
    ┌─────────▼────────┐  ├────▼─┐    │  ┌───────────▼──────┐
    │ Location?        │  │      │    │  │ Student Type?    │
    │ [ON|Out-ON]      │  │ Country   │  │ [Input...]       │
    └─────────┬────────┘  │ [Input]   │  └───────────┬──────┘
              │           │          │              │
    ┌─────────▼────────┐  ├─────────┐│  ┌───────────▼──────┐
    │ Program?         │  │         ││  │ Campus/Program?  │
    │ [Input...]       │  │ Program ││  │ [Input...]       │
    └─────────┬────────┘  │ [Input] ││  └───────────┬──────┘
              │           │         │              │
    ┌─────────▼────────┐  ├────────┐│  ┌───────────▼──────┐
    │ Study Load?      │  │        ││  │ Semester?        │
    │ [Full|Part]      │  │ Load   ││  │ [Input...]       │
    └────┬─────────┬───┘  │[Full   ││  └───────────┬──────┘
         │         │      │ |Part] ││              │
    ┌────▼──┐ ┌───▼───┐   │        ││  ┌───────────▼──────┐
    │Full   │ │Part   │   ├────────┐│  │ Course Load?     │
    │-Time  │ │-Time  │   │        ││  │ [Full|Part]      │
    │Info   │ │Logic  │   │ Summer ││  └────┬─────────┬───┘
    │       │ │       │   │ Info   ││       │         │
    └────┬──┘ └───┬───┘   │        ││   ┌───▼──┐  ┌──▼───┐
         │        │       ├────────┘│   │Full  │  │Part  │
    ┌────▼────────▼────┐  │         │   │-Time │  │-Time │
    │ Summer?          │  │ Tuition ├─► │Info  │  │Logic │
    │ [Yes|No]         │  │ Summary │   │      │  │      │
    └────┬─────────┬───┘  │         │   └──┬───┘  └──┬───┘
         │         │      │ Health  │      │         │
    ┌────▼─────────▼────┐ │Insurance│  ┌───▼─────────▼────┐
    │ Tuition Summary   │ │ ($756)  │  │ Tuition Summary  │
    │ Calculated & Show │ │         │  │ Calculated      │
    └────┬─────────┬───┘ └────┬────┘   └────┬─────────┬───┘
         │         │          │              │         │
    ┌────▼─────────▼────┐  ┌──▼────────┐ ┌──▼─────────▼─────┐
    │ Living Costs?    │  │ Dependents?│ │ Housing Est.?   │
    │ [Yes|No]         │  │ [Y|N]      │ │ [Yes|No]        │
    └────┬─────────┬──┘  └──┬─────┬───┘ └──┬────────┬──────┘
         │         │         │     │        │        │
         │      Skip │        │     └─►Info└────►Skip │
         │      to   │     ┌──▼┐         to       to  │
         │    Optional│     │Dep│       Optional   Optional
         │    Items  │     │Ins│       Items      Items
         │           │     │   │       
         │    ┌──────▼─────▼──┐│   
         │    │               ││   
    ┌────▼─┐ │ Housing Type?  ││   
    │      │ │                ││   
    │Housing│ │ [Res|Off-Camp]││   
    │Type? │ │                ││   
    │[3]   │ │                ││   
    └──┬────┘ └──┬──────────┬──┘│   
       │         │          │          
   ┌───▼─┬────┬──▼────┬─────▼──┐     
   │     │    │       │        │     
[Res] [Off] [Comm] [Res]  [Off] ... 
│     │    │       │        │     
Cost  Cost Cost    Cost     Cost  ...
Info  Info Info    Info     Info  ...
|     │    │       │        │     
└─┬───┴────┴───┬───┴────┬───┴─────┘
  │            │        │         
  └────────┬───┴────┬───┴────┐   
           │        │        │   
    ┌──────▼────────▼────────▼────────┐
    │  Optional Items? (Multiple)    │
    │  [Yes|No]                      │
    │                                │
    │  [Yes] → Select Items Loop    │
    │           (Can add multiple)   │
    │                                │
    │  [No] → Skip to Final         │
    └──────────┬─────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │  🎯 ALL BRANCHES CONVERGE HERE  │
    │                                │
    │  Final Cost Summary            │
    │  ┌────────────────────────┐    │
    │  │ Tuition:     $X,XXX    │    │
    │  │ Living:      $X,XXX    │    │
    │  │ Optional:    $X,XXX    │    │
    │  │ ────────────────────   │    │
    │  │ TOTAL:       $X,XXX    │    │
    │  └────────────────────────┘    │
    │                                │
    │  [Progress: ████████░░ 80%]   │
    │  ✓ Milestone 1  ✓ Milestone 2 │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │ Apply Scholarships/Funding?    │
    │ [Yes|No]                       │
    └──┬────────────┬─────────────────┘
       │[Yes]       │[No]
    ┌──▼────┐    ┌──▼──────────┐
    │ Show  │    │  Skip to    │
    │Eligible│   │  Export     │
    │Items  │    └──┬──────────┘
    └──┬────┘       │
       │            │
    ┌──▼────────────▼────────────────┐
    │ Save Estimate?                │
    │ [Email PDF] [Download] [Skip] │
    └──┬───────────┬────────────┬────┘
       │           │            │
    ┌──▼────┐ ┌───▼────┐ ┌─────▼────┐
    │ Email │ │Download│ │Skip      │
    │Form   │ │PDF     │ │& Exit    │
    └──┬────┘ └───┬────┘ └─────┬────┘
       │          │           │
    ┌──▼──────┐ ┌─▼──────┐ ┌──▼────┐
    │ Sending │ │ Getting│ │        │
    │         │ │        │ │        │
    └──┬──────┘ └─┬──────┘ └───┬───┘
       │          │           │
    ┌──▼──────────▼────────────▼──────────┐
    │    ✓ THANK YOU PAGE               │
    │                                   │
    │  Your estimate has been created  │
    │                                   │
    │  [Start Over]                     │
    └───────────────────────────────────┘
```

---

## Three Branches Side-by-Side Comparison

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ BRANCH 1: 🔵 PROSPECTIVE DOMESTIC  │  BRANCH 2: 🔴 PROSPECTIVE INTL  │  BRANCH 3: 🟢 CURRENT/RETURNING
├─────────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────────┤
│ Location (ON/Out-ON)               │ Country/Status                  │ Student Type                        │
│ ↓                                  │ ↓                               │ ↓                                   │
│ Program                            │ Program                         │ Campus/Program                      │
│ ↓                                  │ ↓                               │ ↓                                   │
│ Study Load ──┐                     │ Study Load ──┐                  │ Semester/Year                       │
│              ├─► Full: Show Info   │              ├─► Full: Show     │ ↓                                   │
│              ├─► Part: Per-Course  │              ├─► Part: Show     │ Study Load ──┐                     │
│ ↓            └─ Logic              │ ↓            └─ Logic           │              ├─► Full: Show Info  │
│ Summer Semester?                   │ Summer Semester?                │              ├─► Part: Per-Course │
│ ↓                                  │ ↓                               │ ↓            └─ Logic             │
│ Tuition Summary                    │ Tuition Summary                 │ Tuition Summary                     │
│ ↓                                  │ ↓                               │ ↓                                   │
│ Living Costs?                      │ Health Insurance                │ Housing Needed?                     │
│ ├─► Yes: Housing Type              │ ($756 added)                    │ ├─► Yes: Housing Type               │
│ └─► No: Skip                       │ ↓                               │ └─► No: Skip                        │
│     ↓                              │ Dependents?                     │     ↓                               │
│ Housing ──┐                        │ ├─► Yes: Add Cost               │ Housing ──┐                         │
│   ├─ Residence                     │ └─► No: Skip                    │   ├─ Residence                      │
│   ├─ Off-campus                    │ ↓                               │   ├─ Off-campus                     │
│   └─ Commute                       │ Living Costs?                   │   └─ Commute                        │
│ ↓                                  │ ├─► Yes: Housing Type           │ ↓                                   │
│ [Show respective costs]            │ └─► No: Skip                    │ [Show respective costs]             │
│ ↓                                  │ ↓                               │ ↓                                   │
│ Optional Items Loop                │ Housing ──┐                     │ Optional Items Loop                 │
│ ├─ Books                           │   ├─ Residence                  │ ├─ Books                            │
│ ├─ Co-op Fees                      │   └─ Off-campus                 │ ├─ Co-op Fee                        │
│ └─ Scholarships                    │ ↓                               │ ├─ Payment Plan                     │
│                                    │ [Show respective costs]         │ └─ Bursary                          │
│                                    │ ↓                               │                                     │
│                                    │ Optional Items Loop             │                                     │
│                                    │ ├─ Books                        │                                     │
│                                    │ ├─ Scholarships                 │                                     │
│                                    │ └─ Work/Co-op Info              │                                     │
└─────────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────────┘
                                    ALL MERGES TO:
                    ◄──── Final Summary ────► [Apply Scholarships?] ────► [Save Estimate?]
```

---

## State Flow Diagram

```
APP_STATE EVOLUTION THROUGH JOURNEY

START
│
├─ currentStep: "start"
├─ currentBranch: null
├─ userChoices: {}
├─ stepHistory: []
└─ completedMilestones: []

                ↓
         USER CLICKS START
                ↓

Step: "user_type_selection"
│
├─ currentStep: "user_type_selection"
├─ stepHistory: ["start"]
├─ milestone: "User Type Selected"
└─ [awaiting choice]

                ↓
    USER SELECTS "Prospective Domestic"
                ↓

Step: "domestic_location"
│
├─ currentStep: "domestic_location"
├─ currentBranch: "prospective_domestic"  ← Branch locked!
├─ stepHistory: ["start", "user_type_selection"]
├─ userChoices: { user_type_selection: "prospective_domestic" }
├─ completedMilestones: ["User Type Selected"]
└─ [awaiting location choice]

                ↓
     USER SELECTS "In Ontario"
                ↓

Step: "domestic_program"
│
├─ currentStep: "domestic_program"
├─ stepHistory: [...previous steps...]
├─ userChoices: {
│    user_type_selection: "prospective_domestic",
│    domestic_location: "ON"
│  }
├─ progressBar: 10%
└─ [awaiting program input]

                ↓
         ... CONTINUES ...
                ↓

Step: "domestic_study_load"
│
├─ currentStep: "domestic_study_load"
├─ userChoices: {
│    user_type_selection: "prospective_domestic",
│    domestic_location: "ON",
│    domestic_program: "Commerce"
│  }
├─ completedMilestones: ["User Type Selected", "Program Chosen"]
├─ progressBar: 20%
└─ [awaiting study load choice]

                ↓
    USER SELECTS "Full-time"
                ↓

Step: "domestic_tuition_review"
│
├─ currentStep: "domestic_tuition_review"
├─ userChoices: {
│    previous choices...
│    domestic_study_load: "fulltime"
│  }
├─ progressBar: 30%
├─ completedMilestones: [..., "Study Load Confirmed"]
└─ [display info then move forward]

                ↓
         ... MORE STEPS ...
                ↓

Step: "final_summary"
│
├─ currentStep: "final_summary"
├─ userChoices: {
│    all previous choices...
│    final data collected
│  }
├─ progressBar: 95%
├─ completedMilestones: [
│    "User Type Selected",
│    "Program Chosen",
│    "Study Load Confirmed",
│    "Housing Selected",
│    "Optional Items Added"
│  ]
└─ [awaiting export choice]

                ↓
    USER CLICKS "Back" BUTTON
                ↓

Step: "export_choice" (returns to previous)
│
├─ currentStep: "export_choice"  ← Returned from history
├─ stepHistory: [..."final_summary"]
└─ [awaiting export method selection]
```

---

## Decision Tree Flowchart

```
                            START
                              │
                              ▼
                    Who are you?
                    (3 branches)
                    /         │         \
                  /           │           \
            DOMESTIC      INTL         CURRENT
             /             │              \
            ✓              ✓               ✓
            │              │               │
        Location        Country         Campus
        2 options       Input field     Input field
            │              │               │
            ▼              ▼               ▼
         Program       Program          Semester
        Input field   Input field      Input field
            │              │               │
            ▼              ▼               ▼
        Load[F/P]      Load[F/P]        Load[F/P]
        2 branches     2 branches       2 branches
         /  \          /  \              /  \
        F    P        F    P            F    P
        │    │        │    │            │    │
        ▼    ▼        ▼    ▼            ▼    ▼
    Info  Logic   Info  Logic       Info  Logic
        \    /        \    /            \    /
         ▼ ▼          ▼ ▼               ▼ ▼
        Summer?     Summer?          [→ Housing?]
        2 branches  2 branches           │
         /  \       /  \            [Y]  │  [N]
       Y    N     Y    N            │    │    │
       │    │     │    │            ▼    ▼    ▼
       ▼    ▼     ▼    ▼        Housing Housing Optional
       Tuition    Tuition       Type    Skip   Items
       Summary    Summary       (3)     │      │
           │          │        /  │ \   │      │
           ▼          ▼       R  O  C  │      │
        Living?    Insurance  │  │  │  │      │
        [Y/N]      [→ Dep?]   ▼  ▼  ▼  │      │
        /  \        /  \     Costs    │      │
       Y    N      Y    N     │       │      │
       │    │      │    │     └───┬───┘      │
       ▼    ▼      ▼    ▼         │         │
    Housing Optional Living?  Optional    Optional
    Type    Items    [Y/N]     Items      Items
    (3)     │        / \       │          │
    /|\     │       Y   N      └──┬───┬───┘
   R O C    │       │    │         │   │
   │ │ │    │       ▼    ▼         │   │
   ▼ ▼ ▼    │     Housing Optional │   │
   Costs    │     Type    Items    │   │
   │        │     (2)     │       │   │
   └────┬───┘     /│\     │       │   │
        │        R O │    │       │   │
        │        │ │ │    │       │   │
        │        ▼ ▼ ▼    │       │   │
        │        Costs    │       │   │
        │        │        │       │   │
        └────────┴──┬─────┴───┬───┘   │
                    │         │       │
                    ▼         ▼       ▼
                Optional Items Loop [Loop or Exit?]
                    │
                    ▼ (all branches)
            ◄─── FINAL SUMMARY ────►
                    │
                    ▼
            Apply Scholarships?
                / \
               Y   N
               │   │
               ▼   ▼
            Eligible Export
             Items   Choice
               │    / │ \
               │   E  D  S
               │   │  │  │
               └───┴──┴──┘
                    │
                    ▼
                Thank You!
```

---

## Mobile Layout Transformation

```
DESKTOP VIEW                    MOBILE VIEW
┌──────────────────┐           ┌──────────────┐
│ ┌──────────────┐ │           │┌────────────┐│
│ │   STEP 1     │ │           ││  STEP 1    ││
│ │              │ │           ││            ││
│ │ [Option 1]   │ │      →    ││[Option 1]  ││
│ │ [Option 2]   │ │           ││[Option 2]  ││
│ │ [Option 3]   │ │           ││[Option 3]  ││
│ └──────────────┘ │           │└────────────┘│
│                  │           │              │
│ ┌──────────────┐ │           │┌────────────┐│
│ │   Progress   │ │           ││ Progress   ││
│ │  ███░░░░░░░  │ │           ││ ████░░░░░░ ││
│ │              │ │           ││ 40% Complete││
│ │ ✓ Badge 1    │ │           ││ ✓ Badge 1  ││
│ │ ✓ Badge 2    │ │           ││ ✓ Badge 2  ││
│ └──────────────┘ │           │└────────────┘│
└──────────────────┘           └──────────────┘

Scrolls vertically            Full width,
in columns                    responsive text
```

---

## CSS Class Hierarchy

```
.flow-wrapper
├─ .step-container (step-welcome | step-decision | step-input | etc.)
│  ├─ .step-header
│  │  ├─ .step-title
│  │  └─ .step-description
│  ├─ .step-content
│  │  ├─ .welcome-content
│  │  ├─ .decision-options
│  │  │  └─ .btn-decision (multiple)
│  │  ├─ .input-form
│  │  │  ├─ .step-input
│  │  │  └─ .btn-primary
│  │  ├─ .multiselect-form
│  │  │  ├─ .checkbox-item (multiple)
│  │  │  └─ .btn-primary
│  │  ├─ .summary-display
│  │  │  ├─ .cost-summary
│  │  │  │  └─ .summary-item (multiple)
│  │  │  └─ .btn-primary
│  │  └─ .end-content
│  └─ .step-footer
│     └─ .btn-secondary
│
.gamification-container
├─ .progress-section
│  ├─ label
│  └─ .progress-bar-wrapper
│     └─ #progressBar
└─ .milestones-section
   └─ .milestone-badge (multiple)
```

This visual representation shows the complete branched architecture, how state evolves, and how all users eventually converge at the final summary!
