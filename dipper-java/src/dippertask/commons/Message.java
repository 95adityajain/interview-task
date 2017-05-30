/*
 * Represents a Message object that is use to communicate with TTL DataStore Server.
 */
package dippertask.commons;

import java.io.Serializable;
/**
 *
 * @author adityajain
 */
public class Message implements Serializable {
    
    private final TTLServerCommand command;
    private final Integer connId;
    private final Integer timeout;

    public Message(TTLServerCommand command, Integer connId, Integer timeout) {
        this.command = command;
        this.connId = connId;
        this.timeout = timeout;
    }

    public TTLServerCommand getCommand() {
        return command;
    }

    public Integer getConnId() {
        return connId;
    }

    public Integer getTimeout() {
        return timeout;
    }

    @Override
    public String toString() {
        return "["+command+","+connId+","+timeout+"]";
    }
}
