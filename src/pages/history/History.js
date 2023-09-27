import { createUseStyles } from "react-jss";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Column from "../../components/Column";
import TasksAPI from "../../http/task.http";
import useError from "../../hooks/useError";
import {
  dateIsInRange,
  dateRenderer,
  isBeforeToday,
  groupByDate,
  handleApiError
} from "../../utilities/helpers";
import { useEffect, useMemo, useState } from "react";
import Task from "../../components/Task";
import FilterBar from "../home/filter-bar/FilterBar";
import HomeTableHeader from "../home/home-table-heading";
import {useWindowSize} from "../../hooks/useWindowSize";
import { TASK_MODEL } from "../../models";
import EditTaskModal from "../home/EditTaskModal";
import Spinner, {SPINNER_POSITIONS} from "../../components/Spinner";

const useStyles = createUseStyles(theme => ({
  taskBodyRoot: {
    paddingTop: 0,
    height: `calc(${window.innerHeight}px - 184px)`,
    overflow: "scroll",
    paddingBottom: 40,
    [theme.mediaQueries.lUp]: {
      paddingBottom: 16
    }
  },
  section: {
    marginBottom: theme.spacing * 3
  },
  sectionHeading: {
    display: "block",
    margin: [theme.spacing * 3, 0, theme.spacing],
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.common.textBlack,
  }
}))

const Completed = () => {
    const showError = useError()
    const [tasks, setTasks] = useState([]);
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreDataToLoad, setHasMoreDataToLoad] = useState(true);
    const [openedTask, setOpenedTask] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const {width} = useWindowSize()
    const isMobile = width < 600

    //for filter
    const [searchInput, setSearchInput] = useState('');
    const [dateFilter, setDateFilters] = useState('');
    const [priority, setPriority] = useState(false);

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async (page) => {
        try {
            const response = await TasksAPI.getTasksCompleted(page);
            const { data } = response;
            console.log(data.data);
            //return true;

            //raggruppo i tasks
            const groupedTasks = groupByDate(data.data);

            setTasks((prevData) => {
                const updatedTasks = { ...prevData };
            
                Object.keys(groupedTasks).forEach((date) => {
                if (updatedTasks[date]) {
                    // If there's an existing list for this date, concatenate the new tasks
                    updatedTasks[date] = [...updatedTasks[date], ...groupedTasks[date]];
                } else {
                    // Otherwise, create a new list
                    updatedTasks[date] = groupedTasks[date];
                }
                });
            
                return updatedTasks;
            });
            
            // Verifico se ci sono ancora dati da caricare
            if (data.data.length === 0) {
                setHasMoreDataToLoad(false); // Imposto su false se non ci sono più dati
            }
        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError
            })
        }
    }

      /**
     * Delete Task
     * @param task
     * @param index
     * @returns {Promise<void>}
     */
    const onDeleteTask = async (task,index) => {
        try {
            await TasksAPI.deleteTask(task[TASK_MODEL.id]);
            onDeleteItem(task[TASK_MODEL.date],index)
        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError
            })
        }
    }

    const onDeleteItem = (key,index) => {
        let newTasks = tasks;
        //remember that key is => date
        //check if is Expired
        if(isBeforeToday(key)){
            newTasks["Expired"].splice(index,1);
        }else{
            newTasks[key].splice(index,1);
        }
        setTasks({...newTasks});
    }

    /**
     * Edit task
     * @param oldTask
     * @param newTask
     * @returns {Promise<void>}
     */
    const onEditTask = async (oldTask,newTask) => {
        try {
            const {data} = await TasksAPI.editTask(newTask);

            // Rimuovo il task dalla lista dei completati se il flag di completamento è stato tolto
            if (!newTask[TASK_MODEL.completed]) {
                setTasks((prevTasks) => {
                    const updatedTasks = { ...prevTasks };
        
                    // Rimuovi il task dalla lista dei completati
                    if (updatedTasks[oldTask[TASK_MODEL.date]]) {
                        updatedTasks[oldTask[TASK_MODEL.date]] = updatedTasks[oldTask[TASK_MODEL.date]].filter(
                            (task) => task[TASK_MODEL.id] !== oldTask[TASK_MODEL.id]
                        );
                    }
    
                    return updatedTasks;
                });
            } else {
                onUpdateItem(oldTask,data)
            }

        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError
            })
        }
    }

    const onUpdateItem = (oldItem,updatedItem) => {
        let newTasks = tasks;
        const isDateChanged = updatedItem[TASK_MODEL.date] !== oldItem[TASK_MODEL.date] && !(isBeforeToday(oldItem[TASK_MODEL.date]) && isBeforeToday(updatedItem[TASK_MODEL.date]))

        if(isDateChanged) {
            //remove the task from old list
            if(isBeforeToday(oldItem[TASK_MODEL.date])){
                newTasks["Expired"].filter(task => task[TASK_MODEL.id] !== updatedItem[TASK_MODEL.id])
            } else {
                newTasks[oldItem[TASK_MODEL.date]] = newTasks[oldItem[TASK_MODEL.date]].filter(task => task[TASK_MODEL.id] !== updatedItem[TASK_MODEL.id])
            }
        } else {
            //update the task in the same list
            if(isBeforeToday(updatedItem[TASK_MODEL.date])) {
                const taskToUpdateIndex = newTasks["Expired"].findIndex(task => task[TASK_MODEL.id] === updatedItem[TASK_MODEL.id])
                newTasks["Expired"][taskToUpdateIndex] = updatedItem
            } else {
                const taskToUpdateIndex = newTasks[updatedItem[TASK_MODEL.date]].findIndex(task => task[TASK_MODEL.id] === updatedItem[TASK_MODEL.id])
                newTasks[updatedItem[TASK_MODEL.date]][taskToUpdateIndex] = updatedItem
            }
        }
        setTasks({...newTasks});
    }

    const filteredTasks = useMemo(
        () => {
            const filtered = {}
            if(tasks){
                Object.keys(tasks).forEach(date => {
                    const filteredDate = tasks[date].filter(t => {
                        const isInDate = dateFilter ?
                            dateIsInRange(t[TASK_MODEL.date], dateFilter?.[0], dateFilter?.[1]) : true
                        const isInSearch = searchInput ? t[TASK_MODEL.description].includes(searchInput) : true
                        const isInPriority = priority ? t[TASK_MODEL.effort] === priority.value : true
                        return isInDate && isInSearch && isInPriority
                    })
                    if(filteredDate.length) filtered[date] = filteredDate
                })
            }
            return filtered
        },
        [tasks, dateFilter, searchInput, priority]
    )

    const handleScroll = (e) => {
        const container = e.target;
        if (
        container.scrollHeight - container.scrollTop === container.clientHeight &&
        !isLoading &&
        hasMoreDataToLoad
        ) {
        setIsLoading(true);
        const nextPage = currentPage + 1;
        fetchTasks(nextPage).then(() => {
            setCurrentPage(nextPage);
            setIsLoading(false);
        });
        }
    };

    return (
        <div onScroll={handleScroll} className="task-container" style={{ height: '800px', overflowY: 'auto' }}>
            <FilterBar
                onSearchHandler={setSearchInput}
                onDateChangeHandler={setDateFilters}
                dateFilter={dateFilter}
                onPriorityHandler={setPriority}
            />
            <HomeTableHeader />
            <Container>
                <Row>
                    <Column start={2} span={10}>
                        {filteredTasks && Object.keys(filteredTasks)?.map((date) => (
                            <div key={date} className={classes.section}>
                                <div className={classes.sectionHeading}>
                                {dateRenderer(date)}
                                </div>
                                {filteredTasks[date]?.map((task, index) => (
                                <Task
                                    key={`${task.id}-${index}`}
                                    task={task}
                                    index={index}
                                    onDeleteCb={onDeleteTask}
                                    onUpdateCb={onEditTask}
                                    onEditCb={() =>{
                                        setOpenedTask(task)
                                        setShowEditModal(true)
                                    }}
                                />
                                ))}
                            </div>
                        ))}
                    </Column>
                </Row>
                {isLoading && <Spinner position={SPINNER_POSITIONS.ABSOLUTE} overlay/>}
            </Container>
            {showEditModal && !isMobile && (
                <EditTaskModal
                    onClose={() => {
                        setShowEditModal(false)
                    }}
                    task={openedTask}
                />
            )}
        </div>
    );
}

export default Completed;
