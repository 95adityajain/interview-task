/*
 * Provides Datastores implementation.
 */
package dippertask.ttlserver;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 * @author adityajain
 */
public class TTLDataStore implements DataStore{
    private final ConcurrentHashMap<Integer, Integer> store;
    
    public TTLDataStore() {
        store = new ConcurrentHashMap<>();
        initStore();
    }
    
    private void initStore() {
        Thread cleanUpThread = new Thread(new CleanupTask(this));
        cleanUpThread.setDaemon(true);
        cleanUpThread.start();
    }
    
    @Override
    public Integer get(Integer key) {
        return store.get(key);
    }
    
    @Override
    public String getAllInStringFormat() {
        StringBuilder builder = new StringBuilder();
        Set<Integer> keySet = store.keySet();
        
        builder.append('{');
        for(Integer key : keySet) {
            if(this.get(key) == -1) continue;
            builder.append('"').append(key.toString()).append('"')
                    .append(':').append('"').append(this.get(key)).append('"')
                    .append(',');
        }
        if(builder.length() > 1){
            builder.setLength(builder.length()-1);
        }
        builder.append('}');
        return builder.toString();
    }
    
    @Override
    public void set(Integer key, Integer val) {
        if(val != null) {
            store.put(key, val);
        }
    }
    
    @Override
    public String contains(Integer key) {
        String result = "0";
        if(store.containsKey(key)) {
            if(store.get(key).equals(-1)) {
                result = "-1";
                store.remove(key);
            } else {
                result = "1";
            }
        }
        return result;
    }
    
    @Override
    public void remove(Integer key) {
        store.remove(key);
    }
    
    @Override
    public void cleanUp() {
        Set<Integer> keySet = store.keySet();
        for(Integer key : keySet) {
            Integer val = this.get(key);
            synchronized(store) {
                if(val != null) {
                    if(val == 1) {
                        store.remove(key);
                    } else if(val != -1) {
                        this.set(key, val-1);
                    }
                }
            }
            Thread.yield();

        }
    }
}
