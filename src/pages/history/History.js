import { createUseStyles } from "react-jss";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Column from "../../components/Column";
import TasksAPI from "../../http/task.http";
import useError from "../../hooks/useError";
import {
  dateRenderer,
  groupByDate,
  handleApiError
} from "../../utilities/helpers";
import { useEffect, useState } from "react";
import Task from "../../components/Task";
import HomeTableHeader from "../home/home-table-heading";
import { TASK_MODEL } from "../../models";
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

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async (page) => {
    try {
      const response = await TasksAPI.getTasksCompleted(page);
      const { data } = response;
      //return true;
      setTasks((prevData) => ({
        ...prevData,
        ...groupByDate(data.data),
      }));  

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
      <HomeTableHeader />
      <Container>
        <Row>
          <Column start={2} span={10}>
            {tasks && Object.keys(tasks).map(date => (
              <div key={date} className={classes.section}>
                <div className={classes.sectionHeading}>
                  {dateRenderer(date)}
                </div>
                {tasks[date].map((task, index) => (
                  <Task
                    key={task.id}
                    task={task}
                    index={index}
                  />
                ))}
              </div>
            ))}
          </Column>
        </Row>
        {isLoading && <Spinner position={SPINNER_POSITIONS.ABSOLUTE} overlay/>}
      </Container>
    </div>
  );
}

export default Completed;
