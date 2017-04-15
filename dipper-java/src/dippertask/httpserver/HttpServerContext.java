/*
 * Represents a storage at server level which can be access by all concurrent threads.
 */
package dippertask.httpserver;

import java.util.concurrent.ConcurrentHashMap;
/**
 *
 * @author adityajain
 */
public class HttpServerContext {
    
    private final ConcurrentHashMap<String, Object> context;
    
    public HttpServerContext() {
        context = new ConcurrentHashMap<>();
    }
    
    public Object get(String key) {
        return context.get(key);
    }
    
    public void set(String key, Object val) {
        if(val != null) {
            context.put(key, val);
        }
    }
    
    public boolean contains(String key) {
        return context.containsKey(key);
    }
    
    public void remove(String key) {
        context.remove(key);
    }
}
