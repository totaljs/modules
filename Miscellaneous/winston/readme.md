# Installation

Download module folder and run this command;

```
    npm install
```

# Usage

This module add all modules log command. Each module include three log mod;

<module_name>_sql - sql logs.
<module_name>_error - error logs.
<module_name>_info - info logs.

Example;

```
    F.logla.monitor_info('Free memory: 5Kb');
    F.logla.db_sql('Select * From World');
    F.logla.flash_error('Gordon');
```

# Directory Tree

Framework logs directory;

..logs/
    monitor/
        sql_20160327.log
        info_20160327.log
    db/
        sql_20160325.log
    flash/
        error_20160325.log
        
Framwork is debug mode all logs using console.log.        