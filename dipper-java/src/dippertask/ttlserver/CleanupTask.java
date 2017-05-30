/**
 * Implements a runnable, which executes each second to reduce TTL of running requests.
 */
package dippertask.ttlserver;

import java.util.concurrent.TimeUnit;

/**
 *
 * @author adityajain
 */
public class CleanupTask implements Runnable {
    
    private final DataStore ttlStore;
    
    public CleanupTask(final DataStore store) {
        ttlStore = store;
    }
    
    @Override
    public void run() {
        while(true){
            try {
                TimeUnit.SECONDS.sleep(1);
                System.out.println("Starting cleanup from thread");
                ttlStore.cleanUp();
            } catch(InterruptedException ie){
                ie.printStackTrace();
            }
        }
    }
}
