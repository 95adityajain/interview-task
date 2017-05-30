/*
 * Implements runnable which handles TTL DataStore server requests.
 */
package dippertask.ttlserver;

import dippertask.commons.Message;
import java.io.ObjectInputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.net.Socket;

/**
 *
 * @author adityajain
 */
public class TTLRequestHandlerTask implements Runnable{
    
    private final Socket clientSocket;
    private final DataStore store;
    
    public TTLRequestHandlerTask(final Socket socket, final DataStore dataStore){
        clientSocket = socket;
        store = dataStore;
    }
    
    @Override
    public void run() {
        try {
            ObjectOutputStream out = new ObjectOutputStream(clientSocket.getOutputStream());
            ObjectInputStream in = new ObjectInputStream(clientSocket.getInputStream());
            
            while(true) {
                Message message = (Message)in.readObject();
                String response = this.handleRequest(message);
                out.writeObject(response);
            }
        } catch(Exception ex) {
            throw new RuntimeException("Error while handling request" + ex);
        } finally {
            try {
                clientSocket.close();
            } catch(IOException ex){
                throw new RuntimeException("Error while closing client socket" + ex);
            }
        }
    }
    
    private String handleRequest(final Message request) {
        String result = null;
        switch(request.getCommand()) {
            case GETALL:
                result =  this.store.getAllInStringFormat();
                break;
            case SET:
                this.store.set(request.getConnId(), request.getTimeout());
                break;
            case CONTAINS:
                result = this.store.contains(request.getConnId());
                break;
            case KILL:
                result = "0";
                if (this.store.contains(request.getConnId()).equals("1")) {
                    result = "1";
                    this.store.set(request.getConnId(), -1);
                }
                break;
        }
        return result;
    }
}
